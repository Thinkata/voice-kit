<template>
  <div class="demo-page">
    <div class="hero-section">
      <h1>Product Feedback Demo</h1>
      <p class="subtitle">
        Experience the power of voice-to-text with intelligent form pre-filling.
        Speak naturally about a product and watch as AI parses your feedback into structured form data.
      </p>
    </div>

    <div class="demo-container">
      <!-- Voice Input Section -->
      <div class="voice-section">
        <!-- VoiceInput is now imported from @thinkata/voice-kit package -->
        <VoiceInput 
          @transcript="handleTranscript" 
          @error="handleVoiceError"
        />
      </div>

      <!-- Error Display -->
      <div v-if="errors.general" class="error-section">
        <div class="error-message">
          <h3>Error:</h3>
          <p>{{ errors.general }}</p>
        </div>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <div class="form-card">
          <h2>📝 Product Feedback Form</h2>
          
          <form @submit.prevent="handleSubmit" class="sample-form">
            <!-- Product Information -->
            <div class="form-section-header">
              <h3>Product Information</h3>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="productName">Product Name *</label>
                <input 
                  type="text" 
                  id="productName" 
                  v-model="formData.productName" 
                  required
                  placeholder="e.g., iPhone 15, MacBook Pro"
                  :class="{ 'highlighted': highlightedFields.productName, 'error': errors.productName }"
                />
                <span v-if="errors.productName" class="error-message">{{ errors.productName }}</span>
              </div>

              <div class="form-group">
                <label for="productCategory">Product Category *</label>
                <select 
                  id="productCategory" 
                  v-model="formData.productCategory" 
                  required
                  :class="{ 'highlighted': highlightedFields.productCategory, 'error': errors.productCategory }"
                >
                  <option value="">Select Category...</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="beauty">Beauty & Health</option>
                  <option value="automotive">Automotive</option>
                  <option value="other">Other</option>
                </select>
                <span v-if="errors.productCategory" class="error-message">{{ errors.productCategory }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="purchaseDate">Purchase Date</label>
              <input 
                type="date" 
                id="purchaseDate" 
                v-model="formData.purchaseDate"
                :class="{ 'highlighted': highlightedFields.purchaseDate, 'error': errors.purchaseDate }"
              />
              <span v-if="errors.purchaseDate" class="error-message">{{ errors.purchaseDate }}</span>
            </div>

            <!-- Feedback Information -->
            <div class="form-section-header">
              <h3>Your Feedback</h3>
            </div>

            <div class="form-group">
              <label for="rating">Overall Rating *</label>
              <select 
                id="rating" 
                v-model="formData.rating" 
                required
                :class="{ 'highlighted': highlightedFields.rating, 'error': errors.rating }"
              >
                <option value="">Select Rating...</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
              <span v-if="errors.rating" class="error-message">{{ errors.rating }}</span>
            </div>

            <div class="form-group">
              <label for="feedback">Detailed Feedback *</label>
              <textarea 
                id="feedback" 
                v-model="formData.feedback" 
                required
                rows="4"
                placeholder="Tell us about your experience with this product..."
                :class="{ 'highlighted': highlightedFields.feedback, 'error': errors.feedback }"
              ></textarea>
              <span v-if="errors.feedback" class="error-message">{{ errors.feedback }}</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="recommendation">Would you recommend this product?</label>
                <select 
                  id="recommendation" 
                  v-model="formData.recommendation"
                  :class="{ 'highlighted': highlightedFields.recommendation, 'error': errors.recommendation }"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes, definitely</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">No, probably not</option>
                </select>
                <span v-if="errors.recommendation" class="error-message">{{ errors.recommendation }}</span>
              </div>

              <div class="form-group">
                <label for="priceRange">Price Range</label>
                <select 
                  id="priceRange" 
                  v-model="formData.priceRange"
                  :class="{ 'highlighted': highlightedFields.priceRange, 'error': errors.priceRange }"
                >
                  <option value="">Select...</option>
                  <option value="under-50">Under $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="over-1000">Over $1,000</option>
                </select>
                <span v-if="errors.priceRange" class="error-message">{{ errors.priceRange }}</span>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="form-section-header">
              <h3>Additional Information</h3>
            </div>

            <div class="form-group">
              <label for="improvements">Suggested Improvements</label>
              <textarea 
                id="improvements" 
                v-model="formData.improvements"
                rows="3"
                placeholder="What would you like to see improved?"
                :class="{ 'highlighted': highlightedFields.improvements, 'error': errors.improvements }"
              ></textarea>
              <span v-if="errors.improvements" class="error-message">{{ errors.improvements }}</span>
            </div>

            <div class="form-group">
              <label for="tags">Product Tags (comma-separated)</label>
              <input 
                type="text" 
                id="tags" 
                v-model="formData.tags"
                placeholder="e.g., durable, lightweight, stylish, affordable"
                :class="{ 'highlighted': highlightedFields.tags, 'error': errors.tags }"
              />
              <span v-if="errors.tags" class="error-message">{{ errors.tags }}</span>
            </div>

            <div class="form-group">
              <label for="newsletter">Subscribe to Product Updates</label>
              <select 
                id="newsletter" 
                v-model="formData.newsletter"
                :class="{ 'highlighted': highlightedFields.newsletter, 'error': errors.newsletter }"
              >
                <option value="">Select...</option>
                <option value="yes">Yes, keep me updated</option>
                <option value="no">No, thanks</option>
              </select>
              <span v-if="errors.newsletter" class="error-message">{{ errors.newsletter }}</span>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
              </button>
              <button type="button" @click="clearForm" class="clear-btn">Clear Form</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
// VoiceInput component copied from @thinkata/voice-kit/dist/components/
import VoiceInput from '~/components/VoiceInput.vue'

// Form structure detection
const formStructure = ref(null)
const detectedFields = ref([])

// Form submission state
const isSubmitting = ref(false)

// Form data structure
const formData = reactive({
  productName: '',
  productCategory: '',
  purchaseDate: '',
  rating: '',
  feedback: '',
  recommendation: '',
  priceRange: '',
  improvements: '',
  tags: '',
  newsletter: ''
})

// Validation errors
const errors = reactive({})

// Highlighted fields (for visual feedback)
const highlightedFields = reactive({
  productName: false,
  productCategory: false,
  purchaseDate: false,
  rating: false,
  feedback: false,
  recommendation: false,
  priceRange: false,
  improvements: false,
  tags: false,
  newsletter: false
})

// Form field detection function
const detectFormFields = () => {
  try {
    // Look for forms on the page
    const forms = document.querySelectorAll('form')
    
    if (forms.length === 0) {
      console.log('No forms detected on page')
      return null
    }
    
    // Use the first form found (or the one with the most fields)
    let targetForm = forms[0]
    let maxFields = 0
    
    forms.forEach(form => {
      const fieldCount = form.querySelectorAll('input, select, textarea').length
      if (fieldCount > maxFields) {
        maxFields = fieldCount
        targetForm = form
      }
    })
    
    const fields = extractFormFields(targetForm)
    const formName = targetForm.getAttribute('name') || 
                    targetForm.querySelector('h1, h2, h3, legend')?.textContent?.trim() ||
                    'Form'
    
    const structure = {
      fields,
      formName,
      formId: targetForm.id || undefined,
      totalFields: fields.length
    }
    
    console.log('Detected form structure:', structure)
    return structure
  } catch (error) {
    console.error('Error detecting form fields:', error)
    return null
  }
}

// Extract form field information from a form element
const extractFormFields = (formElement) => {
  const fields = []
  
  // Get all input, select, and textarea elements
  const inputs = formElement.querySelectorAll('input, select, textarea')
  
  inputs.forEach((element) => {
    const input = element
    const field = {
      name: input.name || input.id || '',
      type: input.type || input.tagName.toLowerCase(),
      required: input.hasAttribute('required'),
      minLength: input.getAttribute('minlength') ? parseInt(input.getAttribute('minlength')) : undefined,
      maxLength: input.getAttribute('maxlength') ? parseInt(input.getAttribute('maxlength')) : undefined,
      pattern: input.getAttribute('pattern') || undefined
    }
    
    // Get label text
    const label = formElement.querySelector(`label[for="${input.id}"]`) || 
                 input.closest('label')
    if (label) {
      field.label = label.textContent?.trim() || ''
    }
    
    // Get placeholder
    if ('placeholder' in input && input.placeholder) {
      field.placeholder = input.placeholder
    }
    
    // Handle select options
    if (input.tagName.toLowerCase() === 'select') {
      const select = input
      field.options = Array.from(select.options).map(option => option.textContent?.trim() || '')
    }
    
    // Handle radio/checkbox groups
    if (input.type === 'radio' || input.type === 'checkbox') {
      const groupName = input.name
      const groupInputs = formElement.querySelectorAll(`input[name="${groupName}"]`)
      if (groupInputs.length > 1) {
        field.options = Array.from(groupInputs).map(input => 
          input.value || input.nextElementSibling?.textContent?.trim() || ''
        )
      }
    }
    
    // Only add fields with meaningful names
    if (field.name) {
      fields.push(field)
    }
  })
  
  return fields
}

// Handle transcript from voice input component
const handleTranscript = async (transcript: string) => {
  console.log('Transcript received:', transcript)
  clearErrors()
  
  try {
    // Parse the transcript using the form structure
    const response = await fetch('/api/parse-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: transcript,
        formStructure: formStructure.value
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Parse speech error:', errorText)
      throw new Error(`Failed to parse speech: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('Parsed data:', result)
    
    // Handle both result.data and direct result
    const data = result.data || result
    
    // Map the parsed data to form fields
    mapDataToForm(data)
    
  } catch (error: any) {
    console.error('Error processing speech:', error)
    setError('general', `Failed to process speech: ${error.message}`)
  }
}

// Handle errors from voice input component
const handleVoiceError = (error: string) => {
  console.error('Voice error:', error)
  setError('general', error)
}



// Dynamic merge function based on detected form fields
const mergeDataToForm = (data) => {
  console.log('Merging data to form:', data)
  console.log('Current form data before merge:', { ...formData })
  console.log('Detected form fields:', detectedFields.value)
  
  let fieldsUpdated = 0
  
  // Map product feedback fields
  const fieldMappings = {
    'productName': 'productName',
    'product': 'productName',
    'name': 'productName',
    'productCategory': 'productCategory',
    'category': 'productCategory',
    'purchaseDate': 'purchaseDate',
    'date': 'purchaseDate',
    'rating': 'rating',
    'score': 'rating',
    'feedback': 'feedback',
    'review': 'feedback',
    'comment': 'feedback',
    'recommendation': 'recommendation',
    'recommend': 'recommendation',
    'priceRange': 'priceRange',
    'price': 'priceRange',
    'improvements': 'improvements',
    'suggestions': 'improvements',
    'tags': 'tags',
    'keywords': 'tags',
    'newsletter': 'newsletter'
  }
  
  // Use detected form fields for dynamic mapping
  if (detectedFields.value && detectedFields.value.length > 0) {
    detectedFields.value.forEach(field => {
      const fieldName = field.name
      let fieldValue = data[fieldName]
      
      // Try alternative field names if direct match not found
      if (!fieldValue) {
        const mappedField = fieldMappings[fieldName]
        if (mappedField && data[mappedField]) {
          fieldValue = data[mappedField]
        }
      }
      
      if (fieldValue !== undefined && fieldValue !== null) {
        const currentValue = formData[fieldName]
        const shouldUpdate = !currentValue || 
                            (typeof fieldValue === 'string' && fieldValue.length > currentValue.length) ||
                            (typeof fieldValue !== 'string')
        
        if (shouldUpdate) {
          formData[fieldName] = fieldValue
          highlightedFields[fieldName] = true
          fieldsUpdated++
          console.log(`Updated ${fieldName}:`, fieldValue)
        }
      }
    })
  } else {
    // Fallback to hardcoded mapping for backward compatibility
    console.log('Using fallback hardcoded field mapping')
    
    // Map product information
    if (data.productName && (!formData.productName || data.productName.length > formData.productName.length)) {
      formData.productName = data.productName
      highlightedFields.productName = true
      fieldsUpdated++
      console.log('Updated productName:', data.productName)
    }
    
    if (data.productCategory && (!formData.productCategory || data.productCategory.length > formData.productCategory.length)) {
      // Normalize category to match dropdown values
      const categoryMapping = {
        'electronics': 'electronics',
        'electronic': 'electronics',
        'electronic devices': 'electronics',
        'clothing': 'clothing',
        'clothes': 'clothing',
        'apparel': 'clothing',
        'books': 'books',
        'book': 'books',
        'home': 'home',
        'home & garden': 'home',
        'sports': 'sports',
        'sport': 'sports',
        'sports & outdoors': 'sports',
        'beauty': 'beauty',
        'beauty & health': 'beauty',
        'health': 'beauty',
        'automotive': 'automotive',
        'auto': 'automotive',
        'car': 'automotive'
      }
      
      const normalizedCategory = categoryMapping[data.productCategory.toLowerCase()] || data.productCategory.toLowerCase()
      formData.productCategory = normalizedCategory
      highlightedFields.productCategory = true
      fieldsUpdated++
      console.log('Updated productCategory:', normalizedCategory)
    }
    
    if (data.purchaseDate && (!formData.purchaseDate || data.purchaseDate.length > formData.purchaseDate.length)) {
      formData.purchaseDate = data.purchaseDate
      highlightedFields.purchaseDate = true
      fieldsUpdated++
      console.log('Updated purchaseDate:', data.purchaseDate)
    }
    
    if (data.rating && (!formData.rating || data.rating.length > formData.rating.length)) {
      // Normalize rating to match dropdown values
      const ratingMapping = {
        '5 - excellent': '5',
        '5 - very good': '5',
        '5': '5',
        '4 - very good': '4',
        '4 - good': '4',
        '4': '4',
        '3 - good': '3',
        '3 - average': '3',
        '3': '3',
        '2 - fair': '2',
        '2 - poor': '2',
        '2': '2',
        '1 - poor': '1',
        '1 - bad': '1',
        '1': '1'
      }
      
      const normalizedRating = ratingMapping[data.rating.toLowerCase()] || data.rating
      formData.rating = normalizedRating
      highlightedFields.rating = true
      fieldsUpdated++
      console.log('Updated rating:', normalizedRating)
    }
    
    if (data.feedback && (!formData.feedback || data.feedback.length > formData.feedback.length)) {
      formData.feedback = data.feedback
      highlightedFields.feedback = true
      fieldsUpdated++
      console.log('Updated feedback:', data.feedback)
    }
    
    if (data.recommendation && (!formData.recommendation || data.recommendation.length > formData.recommendation.length)) {
      // Normalize recommendation to match dropdown values
      const recommendationMapping = {
        'yes': 'yes',
        'yes definitely': 'yes',
        'yes, definitely': 'yes',
        'definitely': 'yes',
        'absolutely': 'yes',
        'maybe': 'maybe',
        'perhaps': 'maybe',
        'possibly': 'maybe',
        'no': 'no',
        'no probably not': 'no',
        'no, probably not': 'no',
        'probably not': 'no',
        'definitely not': 'no'
      }
      
      const normalizedRecommendation = recommendationMapping[data.recommendation.toLowerCase()] || data.recommendation.toLowerCase()
      formData.recommendation = normalizedRecommendation
      highlightedFields.recommendation = true
      fieldsUpdated++
      console.log('Updated recommendation:', normalizedRecommendation)
    }
    
    if (data.priceRange && (!formData.priceRange || data.priceRange.length > formData.priceRange.length)) {
      // Normalize price range to match dropdown values
      const priceRangeMapping = {
        'under $50': 'under-50',
        'under 50': 'under-50',
        'less than $50': 'under-50',
        'fifty-four dollars': '50-100',
        '54 dollars': '50-100',
        '$54': '50-100',
        'fifty four': '50-100',
        '$50 - $100': '50-100',
        '50 - 100': '50-100',
        'fifty to one hundred': '50-100',
        '$100 - $500': '100-500',
        '100 - 500': '100-500',
        'one hundred to five hundred': '100-500',
        '$500 - $1,000': '500-1000',
        '500 - 1000': '500-1000',
        'five hundred to one thousand': '500-1000',
        'over $1,000': 'over-1000',
        'over 1000': 'over-1000',
        'more than $1,000': 'over-1000'
      }
      
      const normalizedPriceRange = priceRangeMapping[data.priceRange.toLowerCase()] || data.priceRange.toLowerCase()
      formData.priceRange = normalizedPriceRange
      highlightedFields.priceRange = true
      fieldsUpdated++
      console.log('Updated priceRange:', normalizedPriceRange)
    }
    
    if (data.improvements && (!formData.improvements || data.improvements.length > formData.improvements.length)) {
      formData.improvements = data.improvements
      highlightedFields.improvements = true
      fieldsUpdated++
      console.log('Updated improvements:', data.improvements)
    }
    
    if (data.tags) {
      const newTags = Array.isArray(data.tags) ? data.tags.join(', ') : data.tags
      if (!formData.tags || newTags.length > formData.tags.length) {
        formData.tags = newTags
        highlightedFields.tags = true
        fieldsUpdated++
        console.log('Updated tags:', newTags)
      }
    }
    
    if (data.newsletter && !formData.newsletter) {
      // Normalize newsletter to match dropdown values
      const newsletterMapping = {
        'yes': 'yes',
        'yes keep me updated': 'yes',
        'yes, keep me updated': 'yes',
        'keep me updated': 'yes',
        'subscribe': 'yes',
        'subscribe me': 'yes',
        'please subscribe': 'yes',
        'subscribe to updates': 'yes',
        'no': 'no',
        'no thanks': 'no',
        'no thank you': 'no'
      }
      
      const normalizedNewsletter = newsletterMapping[data.newsletter.toLowerCase()] || data.newsletter.toLowerCase()
      formData.newsletter = normalizedNewsletter
      highlightedFields.newsletter = true
      fieldsUpdated++
      console.log('Updated newsletter:', normalizedNewsletter)
    }
  }
  
  console.log(`Form merge complete: ${fieldsUpdated} fields updated`)
  console.log('Form data after merge:', { ...formData })
  
  // Clear highlights after a short delay
  setTimeout(() => {
    clearHighlights()
  }, 3000)
}

// Map LLM output to form fields (for full processing)
const mapDataToForm = (data) => {
  console.log('Mapping data to form:', data)
  // Clear previous highlights
  clearHighlights()
  
  // Map product information
  if (data.productName) {
    formData.productName = data.productName
    highlightedFields.productName = true
    console.log('Set productName:', data.productName)
  }
  
  if (data.productCategory) {
    // Normalize category to match dropdown values
    const categoryMapping = {
      'electronics': 'electronics',
      'electronic': 'electronics',
      'electronic devices': 'electronics',
      'clothing': 'clothing',
      'clothes': 'clothing',
      'apparel': 'clothing',
      'books': 'books',
      'book': 'books',
      'home': 'home',
      'home & garden': 'home',
      'sports': 'sports',
      'sport': 'sports',
      'sports & outdoors': 'sports',
      'beauty': 'beauty',
      'beauty & health': 'beauty',
      'health': 'beauty',
      'automotive': 'automotive',
      'auto': 'automotive',
      'car': 'automotive'
    }
    
    const normalizedCategory = categoryMapping[data.productCategory.toLowerCase()] || data.productCategory.toLowerCase()
    formData.productCategory = normalizedCategory
    highlightedFields.productCategory = true
    console.log('Set productCategory:', normalizedCategory)
  }
  
  if (data.purchaseDate) {
    formData.purchaseDate = data.purchaseDate
    highlightedFields.purchaseDate = true
    console.log('Set purchaseDate:', data.purchaseDate)
  }
  
  if (data.rating) {
    // Normalize rating to match dropdown values
    const ratingMapping = {
      '5 - excellent': '5',
      '5 - very good': '5',
      '5': '5',
      '4 - very good': '4',
      '4 - good': '4',
      '4': '4',
      '3 - good': '3',
      '3 - average': '3',
      '3': '3',
      '2 - fair': '2',
      '2 - poor': '2',
      '2': '2',
      '1 - poor': '1',
      '1 - bad': '1',
      '1': '1'
    }
    
    const normalizedRating = ratingMapping[data.rating.toLowerCase()] || data.rating
    formData.rating = normalizedRating
    highlightedFields.rating = true
    console.log('Set rating:', normalizedRating)
  }
  
  if (data.feedback) {
    formData.feedback = data.feedback
    highlightedFields.feedback = true
    console.log('Set feedback:', data.feedback)
  }
  
  if (data.recommendation) {
    // Normalize recommendation to match dropdown values
    const recommendationMapping = {
      'yes': 'yes',
      'yes definitely': 'yes',
      'yes, definitely': 'yes',
      'definitely': 'yes',
      'absolutely': 'yes',
      'maybe': 'maybe',
      'perhaps': 'maybe',
      'possibly': 'maybe',
      'no': 'no',
      'no probably not': 'no',
      'no, probably not': 'no',
      'probably not': 'no',
      'definitely not': 'no'
    }
    
    const normalizedRecommendation = recommendationMapping[data.recommendation.toLowerCase()] || data.recommendation.toLowerCase()
    formData.recommendation = normalizedRecommendation
    highlightedFields.recommendation = true
    console.log('Set recommendation:', normalizedRecommendation)
  }
  
  if (data.priceRange) {
    // Normalize price range to match dropdown values
    const priceRangeMapping = {
      'under $50': 'under-50',
      'under 50': 'under-50',
      'less than $50': 'under-50',
      'fifty-four dollars': '50-100',
      '54 dollars': '50-100',
      '$54': '50-100',
      'fifty four': '50-100',
      '$50 - $100': '50-100',
      '50 - 100': '50-100',
      'fifty to one hundred': '50-100',
      '$100 - $500': '100-500',
      '100 - 500': '100-500',
      'one hundred to five hundred': '100-500',
      '$500 - $1,000': '500-1000',
      '500 - 1000': '500-1000',
      'five hundred to one thousand': '500-1000',
      'over $1,000': 'over-1000',
      'over 1000': 'over-1000',
      'more than $1,000': 'over-1000'
    }
    
    const normalizedPriceRange = priceRangeMapping[data.priceRange.toLowerCase()] || data.priceRange.toLowerCase()
    formData.priceRange = normalizedPriceRange
    highlightedFields.priceRange = true
    console.log('Set priceRange:', normalizedPriceRange)
  }
  
  if (data.improvements) {
    formData.improvements = data.improvements
    highlightedFields.improvements = true
    console.log('Set improvements:', data.improvements)
  }
  
  if (data.tags) {
    formData.tags = Array.isArray(data.tags) 
      ? data.tags.join(', ') 
      : data.tags
    highlightedFields.tags = true
    console.log('Set tags:', data.tags)
  }
  
  if (data.newsletter) {
    // Normalize newsletter to match dropdown values
    const newsletterMapping = {
      'yes': 'yes',
      'yes keep me updated': 'yes',
      'yes, keep me updated': 'yes',
      'keep me updated': 'yes',
      'subscribe': 'yes',
      'subscribe me': 'yes',
      'please subscribe': 'yes',
      'subscribe to updates': 'yes',
      'no': 'no',
      'no thanks': 'no',
      'no thank you': 'no'
    }
    
    const normalizedNewsletter = newsletterMapping[data.newsletter.toLowerCase()] || data.newsletter.toLowerCase()
    formData.newsletter = normalizedNewsletter
    highlightedFields.newsletter = true
    console.log('Set newsletter:', normalizedNewsletter)
  }
  
  // Remove highlights after 3 seconds
  setTimeout(() => {
    clearHighlights()
  }, 3000)
}

// Validation functions
const validateRating = (rating) => {
  const validRatings = ['1', '2', '3', '4', '5']
  return validRatings.includes(rating)
}

const validateDate = (date) => {
  if (!date) return true
  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime()) && dateObj <= new Date()
}

const validateForm = () => {
  clearErrors()
  let isValid = true
  
  // Required fields
  if (!formData.productName.trim()) {
    setError('productName', 'Product name is required')
    isValid = false
  }
  
  if (!formData.productCategory.trim()) {
    setError('productCategory', 'Product category is required')
    isValid = false
  }
  
  if (!formData.rating.trim()) {
    setError('rating', 'Rating is required')
    isValid = false
  } else if (!validateRating(formData.rating)) {
    setError('rating', 'Please select a valid rating')
    isValid = false
  }
  
  if (!formData.feedback.trim()) {
    setError('feedback', 'Feedback is required')
    isValid = false
  }
  
  // Optional field validation
  if (formData.purchaseDate && !validateDate(formData.purchaseDate)) {
    setError('purchaseDate', 'Invalid date')
    isValid = false
  }
  
  return isValid
}

// Error handling
const setError = (field, message) => {
  errors[field] = message
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

const clearHighlights = () => {
  Object.keys(highlightedFields).forEach(key => {
    highlightedFields[key] = false
  })
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Form submitted:', formData)
    alert('Form submitted successfully! Check console for data.')
    
  } catch (error) {
    console.error('Submission error:', error)
    setError('general', 'Failed to submit form. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Clear form
const clearForm = () => {
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  
  clearErrors()
  clearHighlights()
}

onMounted(() => {
  console.log('Speech-to-Form Demo loaded')
  
  // Detect form fields on page load
  formStructure.value = detectFormFields()
  if (formStructure.value) {
    detectedFields.value = formStructure.value.fields
    console.log('Detected form fields:', detectedFields.value)
  }
})
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.hero-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 4rem 2rem;
  text-align: center;
  color: white;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.voice-section,
.form-section {
  margin-bottom: 2rem;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.form-card h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}


.error-section {
  margin: 1rem 0;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
}

.error-message h3 {
  margin: 0 0 0.5rem 0;
  color: #721c24;
}

.error-message p {
  margin: 0;
}

.form-section-header {
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.form-section-header h3 {
  color: #495057;
  margin: 0;
  font-size: 1.3rem;
}

.sample-form {
  margin-top: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.highlighted,
.form-group select.highlighted {
  border-color: #4CAF50;
  background-color: #f8fff8;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  animation: highlight 0.5s ease;
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

@keyframes highlight {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.submit-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}



@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
}

/* Enhanced form field highlighting for real-time updates */
.form-field input.highlighted,
.form-field select.highlighted,
.form-field textarea.highlighted {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  animation: highlightPulse 0.5s ease-in-out;
}

@keyframes highlightPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>

