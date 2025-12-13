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
import { logger } from 'firebase-functions/v2'
import fetch from 'node-fetch'

// ============================================================================
// PAYSTACK CONFIGURATION
// ============================================================================

const PAYSTACK_API_URL = 'https://api.paystack.co'

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const health = onRequest(
  {
    cors: true
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

// ============================================================================
// VERIFY PAYSTACK PAYMENT
// ============================================================================

export const verifyPayment = onRequest(
  { 
    cors: true
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      })
    }

    try {
      const { reference } = req.body
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

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
            'Authorization': `Bearer ${paystackSecretKey}`,
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

      // Return payment details
      const payment = {
        reference: paymentData.reference,
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        email: paymentData.customer.email,
        status: paymentData.status,
        paidAt: paymentData.paid_at,
        channel: paymentData.channel,
        metadata: paymentData.metadata || {}
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
  }
)

// ============================================================================
// PAYSTACK WEBHOOK
// ============================================================================

export const paystackWebhook = onRequest(
  {
    cors: true
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
          logger.info('Successful payment:', event.data.reference)
          break

        case 'subscription.create':
          logger.info('Subscription created:', event.data)
          break

        case 'subscription.disable':
          logger.info('Subscription disabled:', event.data)
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
