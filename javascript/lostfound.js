import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🗝️ Replace these with your own Supabase project values
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_KEY = 'YOUR_PUBLIC_ANON_KEY'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const form = document.getElementById('lostForm')
const itemsDiv = document.getElementById('items')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const item_name = document.getElementById('item_name').value
  const description = document.getElementById('description').value
  const lost_or_found = document.getElementById('lost_or_found').value
  const date = document.getElementById('date').value
  const location = document.getElementById('location').value
  const user_id = document.getElementById('user_id').value
  const file = document.getElementById('image').files[0]

  if (!file) return alert('Please select an image.')

  // Upload the image to Supabase Storage
  const filePath = `images/${Date.now()}_${file.name}`
  const { data: imageData, error: imageError } = await supabase
    .storage
    .from('lostfound-images')
    .upload(filePath, file)

  if (imageError) {
    console.error(imageError)
    alert('Image upload failed.')
    return
  }

  // Insert new record into your Supabase table
  const { error } = await supabase
    .from('lost_found_items')
    .insert([{
      item_name,
      description,
      lost_or_found,
      date,
      location,
      user_id,
      image_url: filePath
    }])

  if (error) {
    console.error(error)
    alert('Error saving item.')
    return
  }

  alert('Item uploaded successfully!')
  form.reset()
  loadItems()
})

// Load and display all items
async function loadItems() {
  const { data, error } = await supabase
    .from('lost_found_items')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  itemsDiv.innerHTML = data.map(item => `
    <div class="item">
      <h3>${item.item_name}</h3>
      <p>${item.description}</p>
      <p class="${item.lost_or_found.toLowerCase()}">${item.lost_or_found}</p>
      <p><strong>Location:</strong> ${item.location}</p>
      <p><strong>Date:</strong> ${item.date}</p>
      <p><strong>Added by:</strong> ${item.user_id}</p>
      ${item.image_url ? `<img src="${SUPABASE_URL}/storage/v1/object/public/lostfound-images/${item.image_url}" alt="${item.item_name}">` : ''}
    </div>
  `).join('')
}

// Load all items when page first opens
loadItems()
