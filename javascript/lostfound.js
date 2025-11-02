import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ---------------- Supabase connection ----------------
const SUPABASE_URL = 'https://yoeydqywoxmslfyxvzkc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZXlkcXl3b3htc2xmeXh2emtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODY4MDAsImV4cCI6MjA3NjA2MjgwMH0.5CRg8qdDk_A16u9PCEWw4CCz3AWv7DtHw_mzmoPqhZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ---------------- DOM elements ----------------
const form = document.getElementById('lostFoundForm')
const message = document.getElementById('message')
const itemsList = document.getElementById('itemsList')
const fileInput = document.getElementById('image_file')

// ---------------- Form submission ----------------
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  message.textContent = 'Uploading...'

  let imageUrl = ''

  try {
    // ---------------- Image upload ----------------
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const fileName = `${Date.now()}_${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('lost-found-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { publicURL, error: urlError } = supabase
        .storage
        .from('lost-found-images')
        .getPublicUrl(fileName)

      if (urlError) throw urlError

      imageUrl = publicURL
      console.log('Image uploaded, URL:', imageUrl)
    }

    // ---------------- Insert data ----------------
    const itemData = {
      item_name: document.getElementById('item_name').value,
      description: document.getElementById('description').value,
      lost_or_found: document.getElementById('lost_or_found').value,
      date: document.getElementById('date').value,
      location: document.getElementById('location').value,
      image_url: imageUrl
    }

    const { data, error } = await supabase
      .from('lost_found_items')
      .insert([itemData])
      .select() // returns inserted rows

    console.log('Insert response:', data, error)

    if (error) throw error

    message.textContent = '✅ Item uploaded successfully!'
    form.reset()
    loadItems()

  } catch (err) {
    console.error('Error:', err)
    message.textContent = '❌ Error saving item! Check console for details.'
  }
})

// ---------------- Load items ----------------
async function loadItems() {
  try {
    const { data, error } = await supabase
      .from('lost_found_items')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error

    itemsList.innerHTML = ''
    if (!data || data.length === 0) {
      itemsList.innerHTML = '<p>No items found.</p>'
      return
    }

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

  } catch (err) {
    console.error('Fetch error:', err)
    itemsList.innerHTML = '<p>Error loading items.</p>'
  }
}

// ---------------- Initial load ----------------
loadItems()
