import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Connect to Supabase
const SUPABASE_URL = 'https://yoeydqywoxmslfyxvzkc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZXlkcXl3b3htc2xmeXh2emtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODY4MDAsImV4cCI6MjA3NjA2MjgwMH0.5CRg8qdDk_A16u9PCEWw4CCz3AWv7DtHw_mzmoPqhZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// DOM elements
const form = document.getElementById('lostFoundForm')
const message = document.getElementById('message')
const itemsList = document.getElementById('itemsList')
const fileInput = document.getElementById('image_file')

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  message.textContent = 'Uploading...'

  let imageUrl = ''

  // Upload image to Supabase Storage if a file is selected
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0]
    const fileName = `${Date.now()}_${file.name}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lost-found-images')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      message.textContent = '❌ Error uploading image!'
      return
    }

    // Get public URL
    const { publicURL, error: urlError } = supabase
      .storage
      .from('lost-found-images')
      .getPublicUrl(fileName)

    if (urlError) {
      console.error('URL error:', urlError)
      message.textContent = '❌ Error getting image URL!'
      return
    }

    imageUrl = publicURL
  }

  // Prepare data to insert into Supabase table
  const itemData = {
    item_name: document.getElementById('item_name').value,
    description: document.getElementById('description').value,
    lost_or_found: document.getElementById('lost_or_found').value,
    date: document.getElementById('date').value,
    location: document.getElementById('location').value,
    image_url: imageUrl
  }

  // Insert into Supabase table
  const { error } = await supabase.from('lost_found_items').insert([itemData])

  if (error) {
    console.error('Insert error:', error)
    message.textContent = '❌ Error saving item!'
  } else {
    message.textContent = '✅ Item uploaded successfully!'
    form.reset()
    loadItems()
  }
})

// Load items from Supabase and display them
async function loadItems() {
  const { data, error } = await supabase
    .from('lost_found_items')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error('Fetch error:', error)
    return
  }

  itemsList.innerHTML = ''
  data.forEach(item => {
    const div = document.createElement('div')
    div.className = 'item-card'
    div.innerHTML = `
      <h3>${item.item_name}</h3>
      <p><strong>${item.lost_or_found}</strong> at ${item.location}</p>
      <p>${item.description || ''}</p>
      <p><i>${item.date ? new Date(item.date).toLocaleDateString() : ''}</i></p>
      ${item.image_url ? `<img src="${item.image_url}" alt="${item.item_name}" />` : ''}
    `
    itemsList.appendChild(div)
  })
}

// Load items when page loads
loadItems()
