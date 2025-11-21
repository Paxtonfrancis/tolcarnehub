import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://yoeydqywoxmslfyxvzkc.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const form = document.getElementById('lostFoundForm')
const message = document.getElementById('message')
const itemsList = document.getElementById('itemsList')
const fileInput = document.getElementById('image_file')

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  message.textContent = 'Uploading...'

  let imageUrl = ''

  try {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const fileName = `${Date.now()}_${cleanName}`

      const { error: uploadError } = await supabase.storage
        .from('lost-found-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicData, error: urlError } = supabase
        .storage
        .from('lost-found-images')
        .getPublicUrl(fileName)

      if (urlError) throw urlError

      imageUrl = publicData.publicUrl
    }

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
      .select()

    if (error) throw error

    message.textContent = '✅ Item uploaded successfully!'
    form.reset()
    loadItems()

  } catch (err) {
    console.error(err)
    message.textContent = '❌ Error saving item! Contact Admin'
  }
})

// Load items from Supabase
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

      if (item.lost_or_found === 'Lost') {
        div.style.border = '2px solid #e74c3c'
        div.style.backgroundColor = '#fdecea'
      } else if (item.lost_or_found === 'Found') {
        div.style.border = '2px solid #27ae60'
        div.style.backgroundColor = '#eafaf1'
      }

      div.innerHTML = `
        <h3>${item.lost_or_found} Item</h3>
        <h4>${item.item_name}</h4>
        <p>${item.description || ''}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><i>${item.date ? new Date(item.date).toLocaleDateString() : ''}</i></p>
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.item_name}" style="max-width: 250px; border-radius: 10px;" />` : ''}
      `
      itemsList.appendChild(div)
    })

  } catch (err) {
    console.error(err)
    itemsList.innerHTML = '<p>Error loading items.</p>'
  }
}

loadItems()

