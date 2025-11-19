<template>
  <ion-page class="invoice-receipt-page">
    <!-- Custom Header (non-Ionic) -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="handleBack" aria-label="Go back">
        <span class="back-icon" aria-hidden="true">←</span>
      </button>
      <h1 class="header-title">Invoice &amp; Receipt Generator</h1>
    </div>

    <ion-content class="ion-padding">
      <!-- Dashboard Cards -->
      <div class="dashboard-container">
        <h1 class="page-title">What would you like to create?</h1>
        <p class="page-subtitle">Select a document type to get started</p>

        <!-- Selection Cards -->
        <div class="cards-grid">
          <!-- Invoice Card -->
          <div 
            class="selection-card"
            :class="{ active: selectedType === 'invoice' }"
            @click="selectType('invoice')"
          >
            <div class="card-icon">
              <ion-icon :icon="documentTextOutline"></ion-icon>
            </div>
            <h2 class="card-title">Invoice</h2>
            <p class="card-description">Create professional invoices for your business</p>
            <div class="card-badge" v-if="selectedType === 'invoice'">Selected</div>
          </div>

          <!-- Receipt Card -->
          <div 
            class="selection-card"
            :class="{ active: selectedType === 'receipt' }"
            @click="selectType('receipt')"
          >
            <div class="card-icon">
              <ion-icon :icon="receiptOutline"></ion-icon>
            </div>
            <h2 class="card-title">Receipt</h2>
            <p class="card-description">Generate receipts for customer transactions</p>
            <div class="card-badge" v-if="selectedType === 'receipt'">Selected</div>
          </div>

          <!-- Signature Card -->
          <div 
            class="selection-card"
            :class="{ active: selectedType === 'signature' }"
            @click="selectType('signature')"
          >
            <div class="card-icon signature">
              <ion-icon :icon="createOutline"></ion-icon>
            </div>
            <h2 class="card-title">Signature</h2>
            <p class="card-description">Create and manage your digital signatures</p>
            <div class="card-badge" v-if="selectedType === 'signature'">Selected</div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="action-buttons" v-if="selectedType">
          <ion-button 
            expand="block" 
            size="default" 
            color="primary"
            @click="proceedToPage"
          >
            <ion-icon slot="start" :icon="arrowForwardOutline"></ion-icon>
            Continue to {{ selectedType === 'invoice' ? 'Invoice' : selectedType === 'receipt' ? 'Receipt' : 'Signature' }}
          </ion-button>
        </div>

        <!-- Template Sections -->
        <!-- Invoice Templates -->
        <div v-if="selectedType === 'invoice'" class="template-section">
          <h2 class="template-section-title">
            <ion-icon :icon="documentTextOutline"></ion-icon>
            Invoice Templates
          </h2>
          <p class="template-section-subtitle">Choose a professional template for your invoice</p>
          
          <div class="templates-grid">
            <!-- Template 1 - Classic Professional -->
            <div 
              class="template-card"
              :class="{ selected: selectedTemplate === 'invoice-classic' }"
              @click="selectTemplate('invoice-classic')"
            >
              <div class="template-preview invoice-preview">
                <div class="preview-page">
                  <div class="preview-header" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 20px; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div class="preview-logo" style="font-size: 18px; font-weight: bold;">COMPANY</div>
                      <div class="preview-title" style="font-size: 24px; font-weight: bold;">INVOICE</div>
                    </div>
                  </div>
                  <div class="preview-content" style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                      <div class="preview-section" style="flex: 1;">
                        <div class="preview-label" style="font-size: 9px; color: #666; margin-bottom: 3px;">Bill To:</div>
                        <div class="preview-line" style="height: 8px; background: #e5e7eb; margin-bottom: 3px; border-radius: 2px;"></div>
                        <div class="preview-line short" style="height: 8px; width: 70%; background: #e5e7eb; border-radius: 2px;"></div>
                      </div>
                      <div class="preview-section" style="flex: 1; text-align: right;">
                        <div class="preview-label" style="font-size: 9px; color: #666; margin-bottom: 3px;">Invoice #:</div>
                        <div class="preview-line" style="height: 8px; background: #e5e7eb; margin-left: auto; width: 60%; border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div class="preview-table" style="border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-top: 15px;">
                      <div class="preview-table-header" style="background: #f3f4f6; padding: 8px; display: flex; gap: 10px;">
                        <div style="flex: 2; height: 8px; background: #d1d5db; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 8px; background: #d1d5db; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 8px; background: #d1d5db; border-radius: 2px;"></div>
                      </div>
                      <div class="preview-row" style="padding: 8px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px;">
                        <div style="flex: 2; height: 6px; background: #e5e7eb; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #e5e7eb; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #e5e7eb; border-radius: 2px;"></div>
                      </div>
                      <div class="preview-row" style="padding: 8px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px;">
                        <div style="flex: 2; height: 6px; background: #e5e7eb; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #e5e7eb; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #e5e7eb; border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 15px; padding: 10px; background: #f9fafb; border-radius: 4px;">
                      <div style="text-align: right;">
                        <div style="font-size: 10px; font-weight: bold; color: #1e40af;">TOTAL</div>
                        <div style="height: 10px; width: 60px; background: #3b82f6; margin-top: 3px; border-radius: 2px;"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="template-info">
                <h3 class="template-name">Classic Professional</h3>
                <p class="template-desc">Traditional blue header with clean layout</p>
                <div class="template-badge" v-if="selectedTemplate === 'invoice-classic'">✓ Selected</div>
              </div>
            </div>

            <!-- Template 2 - Modern Minimal -->
            <div 
              class="template-card"
              :class="{ selected: selectedTemplate === 'invoice-modern' }"
              @click="selectTemplate('invoice-modern')"
            >
              <div class="template-preview invoice-preview">
                <div class="preview-page">
                  <div class="preview-header" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 20px; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div class="preview-logo" style="font-size: 18px; font-weight: bold;">LOGO</div>
                      <div class="preview-title" style="font-size: 24px; font-weight: bold;">INVOICE</div>
                    </div>
                  </div>
                  <div class="preview-content" style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                      <div class="preview-section" style="flex: 1;">
                        <div class="preview-label" style="font-size: 9px; color: #10b981; margin-bottom: 3px; font-weight: 600;">Client</div>
                        <div class="preview-line" style="height: 8px; background: #d1fae5; margin-bottom: 3px; border-radius: 2px;"></div>
                        <div class="preview-line short" style="height: 8px; width: 70%; background: #d1fae5; border-radius: 2px;"></div>
                      </div>
                      <div class="preview-section" style="flex: 1; text-align: right;">
                        <div class="preview-label" style="font-size: 9px; color: #10b981; margin-bottom: 3px; font-weight: 600;">Date</div>
                        <div class="preview-line" style="height: 8px; background: #d1fae5; margin-left: auto; width: 60%; border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div class="preview-table" style="border: 1px solid #d1fae5; border-radius: 4px; overflow: hidden; margin-top: 15px;">
                      <div class="preview-table-header" style="background: #ecfdf5; padding: 8px; display: flex; gap: 10px;">
                        <div style="flex: 2; height: 8px; background: #10b981; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 8px; background: #10b981; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 8px; background: #10b981; border-radius: 2px;"></div>
                      </div>
                      <div class="preview-row" style="padding: 8px; border-top: 1px solid #d1fae5; display: flex; gap: 10px;">
                        <div style="flex: 2; height: 6px; background: #d1fae5; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #d1fae5; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #d1fae5; border-radius: 2px;"></div>
                      </div>
                      <div class="preview-row" style="padding: 8px; border-top: 1px solid #d1fae5; display: flex; gap: 10px;">
                        <div style="flex: 2; height: 6px; background: #d1fae5; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #d1fae5; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #d1fae5; border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 15px; padding: 10px; background: #ecfdf5; border-radius: 4px; border-left: 3px solid #10b981;">
                      <div style="text-align: right;">
                        <div style="font-size: 10px; font-weight: bold; color: #10b981;">AMOUNT DUE</div>
                        <div style="height: 10px; width: 60px; background: #10b981; margin-top: 3px; border-radius: 2px;"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="template-info">
                <h3 class="template-name">Modern Minimal</h3>
                <p class="template-desc">Green accent with minimalist design</p>
                <div class="template-badge" v-if="selectedTemplate === 'invoice-modern'">✓ Selected</div>
              </div>
            </div>

            <!-- Template 3 - Corporate Elegant -->
            <div 
              class="template-card"
              :class="{ selected: selectedTemplate === 'invoice-corporate' }"
              @click="selectTemplate('invoice-corporate')"
            >
              <div class="template-preview invoice-preview">
                <div class="preview-page">
                  <div class="preview-header" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 20px; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div class="preview-logo" style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">CORP</div>
                      <div class="preview-title" style="font-size: 24px; font-weight: bold; letter-spacing: 3px;">INVOICE</div>
                    </div>
                  </div>
                  <div class="preview-content" style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: linear-gradient(to right, #f5f3ff, white); border-left: 3px solid #6366f1; border-radius: 4px;">
                      <div class="preview-section" style="flex: 1;">
                        <div class="preview-label" style="font-size: 9px; color: #6366f1; margin-bottom: 3px; font-weight: 700; text-transform: uppercase;">Billed To</div>
                        <div class="preview-line" style="height: 8px; background: #ddd6fe; margin-bottom: 3px; border-radius: 2px;"></div>
                        <div class="preview-line short" style="height: 8px; width: 70%; background: #ddd6fe; border-radius: 2px;"></div>
                      </div>
                      <div class="preview-section" style="flex: 1; text-align: right;">
                        <div class="preview-label" style="font-size: 9px; color: #6366f1; margin-bottom: 3px; font-weight: 700; text-transform: uppercase;">Invoice Details</div>
                        <div class="preview-line" style="height: 8px; background: #ddd6fe; margin-left: auto; width: 60%; border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div class="preview-table" style="border: 2px solid #e0e7ff; border-radius: 6px; overflow: hidden; margin-top: 15px;">
                      <div class="preview-table-header" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 8px; display: flex; gap: 10px;">
                        <div style="flex: 2; height: 8px; background: rgba(255,255,255,0.9); border-radius: 2px;"></div>
                        <div style="flex: 1; height: 8px; background: rgba(255,255,255,0.9); border-radius: 2px;"></div>
                        <div style="flex: 1; height: 8px; background: rgba(255,255,255,0.9); border-radius: 2px;"></div>
                      </div>
                      <div class="preview-row" style="padding: 8px; border-top: 1px solid #e0e7ff; display: flex; gap: 10px; background: #faf5ff;">
                        <div style="flex: 2; height: 6px; background: #ddd6fe; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #ddd6fe; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #ddd6fe; border-radius: 2px;"></div>
                      </div>
                      <div class="preview-row" style="padding: 8px; border-top: 1px solid #e0e7ff; display: flex; gap: 10px;">
                        <div style="flex: 2; height: 6px; background: #e0e7ff; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #e0e7ff; border-radius: 2px;"></div>
                        <div style="flex: 1; height: 6px; background: #e0e7ff; border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 6px;">
                      <div style="text-align: right;">
                        <div style="font-size: 10px; font-weight: bold; color: white; letter-spacing: 1px;">TOTAL AMOUNT</div>
                        <div style="height: 12px; width: 70px; background: rgba(255,255,255,0.9); margin-top: 3px; border-radius: 3px;"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="template-info">
                <h3 class="template-name">Corporate Elegant</h3>
                <p class="template-desc">Purple gradient with sophisticated style</p>
                <div class="template-badge" v-if="selectedTemplate === 'invoice-corporate'">✓ Selected</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Receipt Templates -->
        <div v-if="selectedType === 'receipt'" class="template-section">
          <h2 class="template-section-title">
            <ion-icon :icon="receiptOutline"></ion-icon>
            Receipt Templates
          </h2>
          <p class="template-section-subtitle">Choose a professional template for your receipt</p>
          
          <div class="templates-grid">
            <!-- Template 1 - Standard Receipt -->
            <div 
              class="template-card"
              :class="{ selected: selectedTemplate === 'receipt-standard' }"
              @click="selectTemplate('receipt-standard')"
            >
              <div class="template-preview receipt-preview">
                <div class="preview-page" style="padding: 0;">
                  <div class="preview-header" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 15px; color: white; text-align: center;">
                    <div class="preview-logo" style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">STORE NAME</div>
                    <div class="preview-title" style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">RECEIPT</div>
                    <div style="font-size: 8px; margin-top: 5px; opacity: 0.9;">123 Main Street, City, State</div>
                  </div>
                  <div class="preview-content" style="padding: 12px;">
                    <div style="text-align: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #cbd5e1;">
                      <div style="font-size: 8px; color: #64748b; margin-bottom: 2px;">Receipt #</div>
                      <div style="height: 6px; width: 50%; background: #e2e8f0; margin: 0 auto; border-radius: 2px;"></div>
                    </div>
                    <div class="preview-items" style="margin: 10px 0;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <div style="height: 6px; width: 60%; background: #e2e8f0; border-radius: 2px;"></div>
                        <div style="height: 6px; width: 20%; background: #e2e8f0; border-radius: 2px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <div style="height: 6px; width: 55%; background: #e2e8f0; border-radius: 2px;"></div>
                        <div style="height: 6px; width: 20%; background: #e2e8f0; border-radius: 2px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <div style="height: 6px; width: 65%; background: #e2e8f0; border-radius: 2px;"></div>
                        <div style="height: 6px; width: 20%; background: #e2e8f0; border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div style="border-top: 2px solid #1e40af; padding-top: 8px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                      <div style="font-size: 10px; font-weight: bold; color: #1e40af;">TOTAL</div>
                      <div style="height: 10px; width: 40px; background: #3b82f6; border-radius: 3px;"></div>
                    </div>
                    <div style="text-align: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
                      <div style="font-size: 7px; color: #94a3b8;">Thank you for your purchase!</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="template-info">
                <h3 class="template-name">Standard Receipt</h3>
                <p class="template-desc">Classic blue design for everyday use</p>
                <div class="template-badge" v-if="selectedTemplate === 'receipt-standard'">✓ Selected</div>
              </div>
            </div>

            <!-- Template 2 - Compact Receipt -->
            <div 
              class="template-card"
              :class="{ selected: selectedTemplate === 'receipt-compact' }"
              @click="selectTemplate('receipt-compact')"
            >
              <div class="template-preview receipt-preview">
                <div class="preview-page" style="padding: 0;">
                  <div class="preview-header" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 12px; color: white; text-align: center;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div class="preview-logo" style="font-size: 14px; font-weight: bold;">SHOP</div>
                      <div class="preview-title" style="font-size: 16px; font-weight: bold;">RECEIPT</div>
                    </div>
                  </div>
                  <div class="preview-content" style="padding: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #fef3c7;">
                      <div style="font-size: 7px; color: #92400e;">
                        <div style="height: 5px; width: 40px; background: #fef3c7; margin-bottom: 2px; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 35px; background: #fef3c7; border-radius: 1px;"></div>
                      </div>
                      <div style="font-size: 7px; color: #92400e; text-align: right;">
                        <div style="height: 5px; width: 35px; background: #fef3c7; margin-bottom: 2px; margin-left: auto; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 30px; background: #fef3c7; margin-left: auto; border-radius: 1px;"></div>
                      </div>
                    </div>
                    <div class="preview-items" style="margin: 8px 0;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 8px;">
                        <div style="height: 5px; width: 50%; background: #fde68a; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 25%; background: #fde68a; border-radius: 1px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 8px;">
                        <div style="height: 5px; width: 55%; background: #fde68a; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 25%; background: #fde68a; border-radius: 1px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 8px;">
                        <div style="height: 5px; width: 45%; background: #fde68a; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 25%; background: #fde68a; border-radius: 1px;"></div>
                      </div>
                    </div>
                    <div style="background: #fffbeb; padding: 8px; border-radius: 4px; margin-top: 8px; border: 1px solid #fef3c7;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 9px; font-weight: bold; color: #f59e0b;">TOTAL</div>
                        <div style="height: 9px; width: 35px; background: #f59e0b; border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div style="text-align: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #fde68a;">
                      <div style="height: 4px; width: 60%; background: #fef3c7; margin: 0 auto; border-radius: 1px;"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="template-info">
                <h3 class="template-name">Compact Receipt</h3>
                <p class="template-desc">Amber theme with space-efficient layout</p>
                <div class="template-badge" v-if="selectedTemplate === 'receipt-compact'">✓ Selected</div>
              </div>
            </div>

            <!-- Template 3 - Detailed Receipt -->
            <div 
              class="template-card"
              :class="{ selected: selectedTemplate === 'receipt-detailed' }"
              @click="selectTemplate('receipt-detailed')"
            >
              <div class="template-preview receipt-preview">
                <div class="preview-page" style="padding: 0;">
                  <div class="preview-header" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 15px; color: white; text-align: center;">
                    <div class="preview-logo" style="font-size: 16px; font-weight: bold; margin-bottom: 3px;">BUSINESS NAME</div>
                    <div style="font-size: 7px; opacity: 0.9; margin-bottom: 6px;">Address Line 1 • City, State ZIP</div>
                    <div class="preview-title" style="font-size: 18px; font-weight: bold; letter-spacing: 2px; padding: 5px 0; border-top: 1px solid rgba(255,255,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.3);">RECEIPT</div>
                  </div>
                  <div class="preview-content" style="padding: 12px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; padding: 8px; background: #fef2f2; border-radius: 4px; border-left: 3px solid #dc2626;">
                      <div style="font-size: 7px;">
                        <div style="color: #dc2626; font-weight: bold; margin-bottom: 2px; font-size: 6px;">RECEIPT NO.</div>
                        <div style="height: 5px; width: 90%; background: #fecaca; border-radius: 1px;"></div>
                      </div>
                      <div style="font-size: 7px;">
                        <div style="color: #dc2626; font-weight: bold; margin-bottom: 2px; font-size: 6px;">DATE</div>
                        <div style="height: 5px; width: 90%; background: #fecaca; border-radius: 1px;"></div>
                      </div>
                      <div style="font-size: 7px;">
                        <div style="color: #dc2626; font-weight: bold; margin-bottom: 2px; font-size: 6px;">CASHIER</div>
                        <div style="height: 5px; width: 90%; background: #fecaca; border-radius: 1px;"></div>
                      </div>
                      <div style="font-size: 7px;">
                        <div style="color: #dc2626; font-weight: bold; margin-bottom: 2px; font-size: 6px;">PAYMENT</div>
                        <div style="height: 5px; width: 90%; background: #fecaca; border-radius: 1px;"></div>
                      </div>
                    </div>
                    <div class="preview-items" style="margin: 10px 0; border: 1px solid #fee2e2; border-radius: 4px; padding: 6px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px solid #fee2e2;">
                        <div style="height: 5px; width: 40%; background: #fecaca; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 15%; background: #fecaca; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 20%; background: #fecaca; border-radius: 1px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <div style="height: 5px; width: 45%; background: #fee2e2; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 10%; background: #fee2e2; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 20%; background: #fee2e2; border-radius: 1px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <div style="height: 5px; width: 50%; background: #fee2e2; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 10%; background: #fee2e2; border-radius: 1px;"></div>
                        <div style="height: 5px; width: 20%; background: #fee2e2; border-radius: 1px;"></div>
                      </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 10px; border-radius: 4px; margin-top: 10px; color: white;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <div style="font-size: 8px;">Subtotal</div>
                        <div style="height: 6px; width: 30px; background: rgba(255,255,255,0.7); border-radius: 1px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <div style="font-size: 8px;">Tax</div>
                        <div style="height: 6px; width: 25px; background: rgba(255,255,255,0.7); border-radius: 1px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.3);">
                        <div style="font-size: 10px; font-weight: bold;">TOTAL</div>
                        <div style="height: 9px; width: 40px; background: white; border-radius: 2px;"></div>
                      </div>
                    </div>
                    <div style="text-align: center; margin-top: 8px; padding: 6px; background: #fef2f2; border-radius: 4px;">
                      <div style="height: 4px; width: 70%; background: #fecaca; margin: 0 auto 3px; border-radius: 1px;"></div>
                      <div style="height: 4px; width: 50%; background: #fecaca; margin: 0 auto; border-radius: 1px;"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="template-info">
                <h3 class="template-name">Detailed Receipt</h3>
                <p class="template-desc">Red accent with comprehensive details</p>
                <div class="template-badge" v-if="selectedTemplate === 'receipt-detailed'">✓ Selected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/vue'
import {
  documentTextOutline,
  receiptOutline,
  createOutline,
  arrowForwardOutline,
} from 'ionicons/icons'

const router = useRouter()

// State
const selectedType = ref<'invoice' | 'receipt' | 'signature' | null>(null)
const selectedTemplate = ref<string | null>(null)

// Back navigation logic (robust fallback)
function handleBack() {
  // Prefer router history if available
  try {
    // If there is a previous history entry use native back
    if (window.history.length > 1) {
      window.history.back()
      return
    }
  } catch (e) {
    // ignore and fallback
  }
  // Fallback: navigate explicitly to home
  router.push('/home')
}

// Select document type
function selectType(type: 'invoice' | 'receipt' | 'signature') {
  selectedType.value = type
  selectedTemplate.value = null // Reset template selection when changing type
}

// Select template
function selectTemplate(template: string) {
  selectedTemplate.value = template
}

// Navigate to selected page
function proceedToPage() {
  if (!selectedType.value) return
  
  if (selectedType.value === 'signature') {
    // Go directly to signature page
    router.push('/signature')
  } else if (selectedType.value === 'invoice') {
    // Go to invoice page with selected template
    router.push({
      path: '/invoice',
      query: { template: selectedTemplate.value || 'classic-professional' }
    })
  } else if (selectedType.value === 'receipt') {
    // Go to receipt page with selected template
    router.push({
      path: '/receipt',
      query: { template: selectedTemplate.value || 'standard' }
    })
  }
}
</script>

<style scoped>
.invoice-receipt-page {
  --background: linear-gradient(135deg, #f8fafc 0%, #e7f0f7 100%);
}

/* Custom Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  border-bottom: 1px solid #e2e8f0;
}

.back-btn {
  appearance: none;
  border: none;
  background: linear-gradient(135deg,#f1f5f9,#e2e8f0);
  color: #0f172a;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all .25s ease;
}

.back-btn:hover {
  background: linear-gradient(135deg,#e2e8f0,#cbd5e1);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.back-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.12);
}

.back-icon { line-height: 1; }

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: .5px;
  background: linear-gradient(90deg,#0f172a,#334155);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

@media (min-width: 640px) {
  .header-title { font-size: 1.35rem; }
}

.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 0.375rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 2rem;
}

/* Selection Cards */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.selection-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.selection-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.11);
  border-color: #06b6d4;
}

.selection-card.active {
  border-color: #06b6d4;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(6, 182, 212, 0.02) 100%);
}

.card-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 12px rgba(6, 182, 212, 0.25);
}

.card-icon ion-icon {
  font-size: 1.875rem;
  color: white;
}

.card-icon.signature {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 6px 12px rgba(139, 92, 246, 0.25);
}

.card-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
}

.card-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #06b6d4;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Template Section Styles */
.template-section {
  margin-top: 2rem;
  animation: fadeIn 0.5s ease;
}

.template-section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.template-section-title ion-icon {
  font-size: 1.75rem;
  color: #06b6d4;
}

.template-section-subtitle {
  font-size: 0.9375rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #06b6d4;
}

.template-card.selected {
  border-color: #06b6d4;
  box-shadow: 0 8px 24px rgba(6, 182, 212, 0.2);
}

/* Template Preview Styles */
.template-preview {
  width: 100%;
  aspect-ratio: 8.5 / 11;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
}

.invoice-preview .preview-page,
.receipt-preview .preview-page {
  width: 100%;
  height: 100%;
  background: white;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

/* Template Info */
.template-info {
  padding: 1rem;
}

.template-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.375rem;
}

.template-desc {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.template-badge {
  display: inline-block;
  background: #06b6d4;
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Action Buttons */
.action-buttons {
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .selection-card {
    padding: 1.25rem;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
  }
  
  .card-icon ion-icon {
    font-size: 1.5rem;
  }
  
  .card-title {
    font-size: 1.125rem;
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .template-section-title {
    font-size: 1.25rem;
  }
  
  .template-section-title ion-icon {
    font-size: 1.5rem;
  }
}
</style>
