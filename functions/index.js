/**
 * Firebase Cloud Functions for SmartDesignPro
 * Handles Paystack payment verification and webhooks
 * 
 * FREE TIER LIMITS:
 * - 2M invocations/month
 * - 400K GB-seconds/month
 * - 200K CPU-seconds/month
 */

import { onRequest } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import fetch from 'node-fetch'
import cors from 'cors'

// Initialize Firebase Admin
initializeApp()
const db = getFirestore()

// CORS setup
const corsHandler = cors({ origin: true })

// ============================================================================
// PAYSTACK CONFIGURATION
// ============================================================================

// Using defineSecret for secure environment variables
import { defineSecret } from 'firebase-functions/params'
const paystackSecretKey = defineSecret('PAYSTACK_SECRET_KEY')

const PAYSTACK_API_URL = 'https://api.paystack.co'

// ============================================================================
// VERIFY PAYSTACK PAYMENT
// ============================================================================

export const verifyPayment = onRequest(
  { 
    timeoutSeconds: 30,
    memory: '256MiB',
    cors: true,
    secrets: [paystackSecretKey]
  },
  async (req, res) => {
    return corsHandler(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        })
      }

      try {
        const { reference } = req.body

        if (!reference) {
          return res.status(400).json({
            success: false,
            message: 'Payment reference is required'
          })
        }

        logger.info('Verifying payment:', { reference })

        // Verify payment with Paystack
        const paystackResponse = await fetch(
          `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${paystackSecretKey.value()}`,
              'Content-Type': 'application/json'
            }
          }
        )

        const paystackData = await paystackResponse.json()

        if (!paystackData.status) {
          logger.error('Paystack verification failed:', paystackData)
          return res.status(400).json({
            success: false,
            message: paystackData.message || 'Payment verification failed'
          })
        }

        const paymentData = paystackData.data

        // Check if payment was successful
        if (paymentData.status !== 'success') {
          return res.status(400).json({
            success: false,
            message: 'Payment was not successful'
          })
        }

        // Save payment to Firestore
        const paymentRef = db.collection('payments').doc(reference)
        const paymentDoc = await paymentRef.get()

        if (paymentDoc.exists) {
          logger.warn('Payment already processed:', { reference })
          return res.json({
            success: true,
            message: 'Payment already processed',
            data: paymentDoc.data()
          })
        }

        // Store payment details
        const payment = {
          reference: paymentData.reference,
          amount: paymentData.amount / 100, // Convert from kobo to naira
          currency: paymentData.currency,
          email: paymentData.customer.email,
          status: paymentData.status,
          paidAt: paymentData.paid_at,
          channel: paymentData.channel,
          metadata: paymentData.metadata || {},
          createdAt: new Date().toISOString(),
          userId: paymentData.metadata?.userId || null,
          plan: paymentData.metadata?.plan || null
        }

        await paymentRef.set(payment)

        // Update user subscription if userId is provided
        if (payment.userId && payment.plan) {
          const userRef = db.collection('users').doc(payment.userId)
          const subscriptionData = {
            plan: payment.plan,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
            paymentReference: reference,
            updatedAt: new Date().toISOString()
          }

          await userRef.update({
            subscription: subscriptionData
          })

          logger.info('User subscription updated:', { userId: payment.userId, plan: payment.plan })
        }

        logger.info('Payment verified successfully:', { reference })

        return res.json({
          success: true,
          message: 'Payment verified successfully',
          data: payment
        })

      } catch (error) {
        logger.error('Payment verification error:', error)
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        })
      }
    })
  }
)

// ============================================================================
// PAYSTACK WEBHOOK
// ============================================================================

export const paystackWebhook = onRequest(
  {
    timeoutSeconds: 30,
    memory: '256MiB'
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed')
    }

    try {
      const event = req.body

      logger.info('Webhook received:', { event: event.event })

      // Handle different webhook events
      switch (event.event) {
        case 'charge.success':
          await handleSuccessfulPayment(event.data)
          break

        case 'subscription.create':
          await handleSubscriptionCreate(event.data)
          break

        case 'subscription.disable':
          await handleSubscriptionDisable(event.data)
          break

        default:
          logger.info('Unhandled webhook event:', event.event)
      }

      res.status(200).send('Webhook processed')

    } catch (error) {
      logger.error('Webhook error:', error)
      res.status(500).send('Webhook processing failed')
    }
  }
)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function handleSuccessfulPayment(data) {
  const reference = data.reference
  const paymentRef = db.collection('payments').doc(reference)
  const paymentDoc = await paymentRef.get()

  if (!paymentDoc.exists) {
    // Store payment if not already stored
    const payment = {
      reference: data.reference,
      amount: data.amount / 100,
      currency: data.currency,
      email: data.customer.email,
      status: data.status,
      paidAt: data.paid_at,
      channel: data.channel,
      metadata: data.metadata || {},
      createdAt: new Date().toISOString()
    }
    await paymentRef.set(payment)
    logger.info('Payment stored from webhook:', { reference })
  }
}

async function handleSubscriptionCreate(data) {
  logger.info('Subscription created:', data)
  // Handle subscription creation logic
}

async function handleSubscriptionDisable(data) {
  logger.info('Subscription disabled:', data)
  // Handle subscription cancellation logic
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const health = onRequest(
  {
    timeoutSeconds: 10,
    memory: '128MiB'
  },
  (req, res) => {
    res.json({
      status: 'ok',
      service: 'SmartDesignPro Cloud Functions',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    })
  }
)
