<template>
  <div class="demo-page">
    <div class="hero-section">
      <h1>Speech-to-Form Demo</h1>
      <p class="subtitle">
        Experience the power of voice-to-text with intelligent form pre-filling.
        Speak naturally and watch as AI parses your speech into structured form data.
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
          <h2>📝 Personal Information Form</h2>
          
          <form @submit.prevent="handleSubmit" class="sample-form">
            <!-- Basic Information -->
            <div class="form-section-header">
              <h3>Basic Information</h3>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name *</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="formData.firstName" 
                  required
                  :class="{ 'highlighted': highlightedFields.firstName, 'error': errors.firstName }"
                />
                <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
              </div>

              <div class="form-group">
                <label for="lastName">Last Name *</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="formData.lastName" 
                  required
                  :class="{ 'highlighted': highlightedFields.lastName, 'error': errors.lastName }"
                />
                <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="formData.email" 
                  required
                  :class="{ 'highlighted': highlightedFields.email, 'error': errors.email }"
                />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>

              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="formData.phone"
                  :class="{ 'highlighted': highlightedFields.phone, 'error': errors.phone }"
                />
                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="dateOfBirth">Date of Birth</label>
              <input 
                type="date" 
                id="dateOfBirth" 
                v-model="formData.dateOfBirth"
                :class="{ 'highlighted': highlightedFields.dateOfBirth, 'error': errors.dateOfBirth }"
              />
              <span v-if="errors.dateOfBirth" class="error-message">{{ errors.dateOfBirth }}</span>
            </div>

            <!-- Address Information -->
            <div class="form-section-header">
              <h3>Address</h3>
            </div>

            <div class="form-group">
              <label for="street">Street Address</label>
              <input 
                type="text" 
                id="street" 
                v-model="formData.address.street"
                :class="{ 'highlighted': highlightedFields.street, 'error': errors.street }"
              />
              <span v-if="errors.street" class="error-message">{{ errors.street }}</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="city">City</label>
                <input 
                  type="text" 
                  id="city" 
                  v-model="formData.address.city"
                  :class="{ 'highlighted': highlightedFields.city, 'error': errors.city }"
                />
                <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
              </div>

              <div class="form-group">
                <label for="state">State</label>
                <input 
                  type="text" 
                  id="state" 
                  v-model="formData.address.state"
                  :class="{ 'highlighted': highlightedFields.state, 'error': errors.state }"
                />
                <span v-if="errors.state" class="error-message">{{ errors.state }}</span>
              </div>

              <div class="form-group">
                <label for="zipCode">ZIP Code</label>
                <input 
                  type="text" 
                  id="zipCode" 
                  v-model="formData.address.zipCode"
                  :class="{ 'highlighted': highlightedFields.zipCode, 'error': errors.zipCode }"
                />
                <span v-if="errors.zipCode" class="error-message">{{ errors.zipCode }}</span>
              </div>
            </div>

            <!-- Preferences -->
            <div class="form-section-header">
              <h3>Preferences</h3>
            </div>

            <div class="form-group">
              <label for="occupation">Occupation</label>
              <input 
                type="text" 
                id="occupation" 
                v-model="formData.occupation"
                :class="{ 'highlighted': highlightedFields.occupation, 'error': errors.occupation }"
              />
              <span v-if="errors.occupation" class="error-message">{{ errors.occupation }}</span>
            </div>

            <div class="form-group">
              <label for="interests">Interests (comma-separated)</label>
              <input 
                type="text" 
                id="interests" 
                v-model="formData.interests"
                placeholder="e.g., hiking, photography, cooking"
                :class="{ 'highlighted': highlightedFields.interests, 'error': errors.interests }"
              />
              <span v-if="errors.interests" class="error-message">{{ errors.interests }}</span>
            </div>

            <div class="form-group">
              <label for="newsletter">Subscribe to Newsletter</label>
              <select 
                id="newsletter" 
                v-model="formData.newsletter"
                :class="{ 'highlighted': highlightedFields.newsletter, 'error': errors.newsletter }"
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
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
import { ref, reactive, onMounted } from 'vue'
// VoiceInput component copied from @thinkata/voice-kit/dist/components/
import VoiceInput from '~/components/VoiceInput.vue'

// Form structure detection
const formStructure = ref(null)
const detectedFields = ref([])

// Form submission state
const isSubmitting = ref(false)

// Form data structure
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: ''
  },
  occupation: '',
  interests: '',
  newsletter: ''
})

// Validation errors
const errors = reactive({})

// Highlighted fields (for visual feedback)
const highlightedFields = reactive({
  firstName: false,
  lastName: false,
  email: false,
  phone: false,
  dateOfBirth: false,
  street: false,
  city: false,
  state: false,
  zipCode: false,
  occupation: false,
  interests: false,
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
  
  // Dynamic field mapping based on detected form structure
  if (detectedFields.value && detectedFields.value.length > 0) {
    // Map common address field names to nested structure
    const addressMapping = {
      'streetAddress': 'street',
      'street': 'street',
      'city': 'city',
      'state': 'state',
      'zipCode': 'zipCode',
      'zip': 'zipCode',
      'postalCode': 'zipCode'
    }
    
    // Use detected form fields for dynamic mapping
    detectedFields.value.forEach(field => {
      const fieldName = field.name
      let fieldValue = data[fieldName]
      
      // Handle nested address fields
      if (!fieldValue && data.address) {
        const mappedField = addressMapping[fieldName]
        if (mappedField && data.address[mappedField]) {
          fieldValue = data.address[mappedField]
        }
      }
      
      if (fieldValue !== undefined && fieldValue !== null) {
        // Check if we should update this field (only if empty or new data is more complete)
        let currentValue
        let shouldUpdate = false
        
        // Handle nested address fields
        if (['streetAddress', 'street', 'city', 'state', 'zipCode', 'zip', 'postalCode'].includes(fieldName)) {
          const addressField = addressMapping[fieldName] || fieldName
          currentValue = formData.address[addressField]
          shouldUpdate = !currentValue || 
                        (typeof fieldValue === 'string' && fieldValue.length > currentValue.length) ||
                        (typeof fieldValue !== 'string')
          
          if (shouldUpdate) {
            formData.address[addressField] = fieldValue
            highlightedFields[addressField] = true
            fieldsUpdated++
            console.log(`Updated address.${addressField}:`, fieldValue)
          }
        } else {
          // Handle top-level fields
          currentValue = formData[fieldName]
          shouldUpdate = !currentValue || 
                        (typeof fieldValue === 'string' && fieldValue.length > currentValue.length) ||
                        (typeof fieldValue !== 'string')
          
          if (shouldUpdate) {
            formData[fieldName] = fieldValue
            highlightedFields[fieldName] = true
            fieldsUpdated++
            console.log(`Updated ${fieldName}:`, fieldValue)
          }
        }
      }
    })
  } else {
    // Fallback to hardcoded mapping for backward compatibility
    console.log('Using fallback hardcoded field mapping')
    
    // Map basic information (only if field is empty or new data is more complete)
    if (data.firstName && (!formData.firstName || data.firstName.length > formData.firstName.length)) {
      formData.firstName = data.firstName
      highlightedFields.firstName = true
      fieldsUpdated++
      console.log('Updated firstName:', data.firstName)
    }
    
    if (data.lastName && (!formData.lastName || data.lastName.length > formData.lastName.length)) {
      formData.lastName = data.lastName
      highlightedFields.lastName = true
      fieldsUpdated++
      console.log('Updated lastName:', data.lastName)
    }
    
    if (data.email && (!formData.email || data.email.length > formData.email.length)) {
      formData.email = data.email
      highlightedFields.email = true
      fieldsUpdated++
      console.log('Updated email:', data.email)
    }
    
    if (data.phone && (!formData.phone || data.phone.length > formData.phone.length)) {
      formData.phone = data.phone
      highlightedFields.phone = true
      fieldsUpdated++
      console.log('Updated phone:', data.phone)
    }
    
    if (data.dateOfBirth && (!formData.dateOfBirth || data.dateOfBirth.length > formData.dateOfBirth.length)) {
      formData.dateOfBirth = data.dateOfBirth
      highlightedFields.dateOfBirth = true
      fieldsUpdated++
      console.log('Updated dateOfBirth:', data.dateOfBirth)
    }
    
    // Handle address fields - both nested and flattened structures
    if (data.address) {
      // Handle nested address structure
      if (data.address.street && (!formData.address.street || data.address.street.length > formData.address.street.length)) {
        formData.address.street = data.address.street
        highlightedFields.street = true
        fieldsUpdated++
        console.log('Updated address.street:', data.address.street)
      }
      
      if (data.address.city && (!formData.address.city || data.address.city.length > formData.address.city.length)) {
        formData.address.city = data.address.city
        highlightedFields.city = true
        fieldsUpdated++
        console.log('Updated address.city:', data.address.city)
      }
      
      if (data.address.state && (!formData.address.state || data.address.state.length > formData.address.state.length)) {
        formData.address.state = data.address.state
        highlightedFields.state = true
        fieldsUpdated++
        console.log('Updated address.state:', data.address.state)
      }
      
      if (data.address.zipCode && (!formData.address.zipCode || data.address.zipCode.length > formData.address.zipCode.length)) {
        formData.address.zipCode = data.address.zipCode
        highlightedFields.zipCode = true
        fieldsUpdated++
        console.log('Updated address.zipCode:', data.address.zipCode)
      }
    } else {
      // Handle flattened address structure (when LLM returns individual address fields)
      if (data.street && (!formData.address.street || data.street.length > formData.address.street.length)) {
        formData.address.street = data.street
        highlightedFields.street = true
        fieldsUpdated++
        console.log('Updated street:', data.street)
      }
      
      if (data.city && (!formData.address.city || data.city.length > formData.address.city.length)) {
        formData.address.city = data.city
        highlightedFields.city = true
        fieldsUpdated++
        console.log('Updated city:', data.city)
      }
      
      if (data.state && (!formData.address.state || data.state.length > formData.address.state.length)) {
        formData.address.state = data.state
        highlightedFields.state = true
        fieldsUpdated++
        console.log('Updated state:', data.state)
      }
      
      if (data.zipCode && (!formData.address.zipCode || data.zipCode.length > formData.address.zipCode.length)) {
        formData.address.zipCode = data.zipCode
        highlightedFields.zipCode = true
        fieldsUpdated++
        console.log('Updated zipCode:', data.zipCode)
      }
    }
    
    if (data.occupation && (!formData.occupation || data.occupation.length > formData.occupation.length)) {
      formData.occupation = data.occupation
      highlightedFields.occupation = true
      fieldsUpdated++
      console.log('Updated occupation:', data.occupation)
    }
    
    if (data.interests) {
      const newInterests = Array.isArray(data.interests) ? data.interests.join(', ') : data.interests
      if (!formData.interests || newInterests.length > formData.interests.length) {
        formData.interests = newInterests
        highlightedFields.interests = true
        fieldsUpdated++
        console.log('Updated interests:', newInterests)
      }
    }
    
    if (data.newsletter && !formData.newsletter) {
      formData.newsletter = data.newsletter
      highlightedFields.newsletter = true
      fieldsUpdated++
      console.log('Updated newsletter:', data.newsletter)
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
  
  // Map basic information
  if (data.firstName) {
    formData.firstName = data.firstName
    highlightedFields.firstName = true
    console.log('Set firstName:', data.firstName)
  }
  
  if (data.lastName) {
    formData.lastName = data.lastName
    highlightedFields.lastName = true
  }
  
  if (data.email) {
    formData.email = data.email
    highlightedFields.email = true
  }
  
  if (data.phone) {
    formData.phone = data.phone
    highlightedFields.phone = true
  }
  
  if (data.dateOfBirth) {
    formData.dateOfBirth = data.dateOfBirth
    highlightedFields.dateOfBirth = true
  }
  
  // Map address information - handle both nested and flattened structures
  if (data.address) {
    // Handle nested address structure
    if (data.address.street) {
      formData.address.street = data.address.street
      highlightedFields.street = true
      console.log('Set address.street:', data.address.street)
    }
    
    if (data.address.city) {
      formData.address.city = data.address.city
      highlightedFields.city = true
      console.log('Set address.city:', data.address.city)
    }
    
    if (data.address.state) {
      formData.address.state = data.address.state
      highlightedFields.state = true
      console.log('Set address.state:', data.address.state)
    }
    
    if (data.address.zipCode) {
      formData.address.zipCode = data.address.zipCode
      highlightedFields.zipCode = true
      console.log('Set address.zipCode:', data.address.zipCode)
    }
  } else {
    // Handle flattened address structure (when LLM returns individual address fields)
    if (data.street) {
      formData.address.street = data.street
      highlightedFields.street = true
      console.log('Set street:', data.street)
    }
    
    if (data.city) {
      formData.address.city = data.city
      highlightedFields.city = true
      console.log('Set city:', data.city)
    }
    
    if (data.state) {
      formData.address.state = data.state
      highlightedFields.state = true
      console.log('Set state:', data.state)
    }
    
    if (data.zipCode) {
      formData.address.zipCode = data.zipCode
      highlightedFields.zipCode = true
      console.log('Set zipCode:', data.zipCode)
    }
  }
  
  // Map preferences
  if (data.occupation) {
    formData.occupation = data.occupation
    highlightedFields.occupation = true
  }
  
  if (data.interests) {
    formData.interests = Array.isArray(data.interests) 
      ? data.interests.join(', ') 
      : data.interests
    highlightedFields.interests = true
  }
  
  if (data.newsletter) {
    formData.newsletter = data.newsletter
    highlightedFields.newsletter = true
  }
  
  // Remove highlights after 3 seconds
  setTimeout(() => {
    clearHighlights()
  }, 3000)
}

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  if (!phone) return true
  const phoneRegex = /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/
  return phoneRegex.test(phone)
}

const validateForm = () => {
  clearErrors()
  let isValid = true
  
  // Required fields
  if (!formData.firstName.trim()) {
    setError('firstName', 'First name is required')
    isValid = false
  }
  
  if (!formData.lastName.trim()) {
    setError('lastName', 'Last name is required')
    isValid = false
  }
  
  if (!formData.email.trim()) {
    setError('email', 'Email is required')
    isValid = false
  } else if (!validateEmail(formData.email)) {
    setError('email', 'Invalid email format')
    isValid = false
  }
  
  // Optional field validation
  if (formData.phone && !validatePhone(formData.phone)) {
    setError('phone', 'Invalid phone number format')
    isValid = false
  }
  
  if (formData.dateOfBirth) {
    const date = new Date(formData.dateOfBirth)
    if (isNaN(date.getTime()) || date > new Date()) {
      setError('dateOfBirth', 'Invalid date')
      isValid = false
    }
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
    if (typeof formData[key] === 'object') {
      Object.keys(formData[key]).forEach(subKey => {
        formData[key][subKey] = ''
      })
    } else {
      formData[key] = ''
    }
  })
  
  parsedData.value = null
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

