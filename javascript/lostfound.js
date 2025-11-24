// Import Supabase client library from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


// Supabase project URL and anonymous/public key
const SUPABASE_URL = 'https://yoeydqywoxmslfyxvzkc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZXlkcXl3b3htc2xmeXh2emtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODY4MDAsImV4cCI6MjA3NjA2MjgwMH0.5CRg8qdDk_A16u9PCEWw4CCz3AWv7DtHw_mzmoPqhZ8'

// Create a Supabase client instance to interact with database and storage
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


// Get references to the form and relevant elements
const form = document.getElementById('lostFoundForm')
const message = document.getElementById('message') // Area to show success/error messages
const itemsList = document.getElementById('itemsList') // Container for displaying items
const fileInput = document.getElementById('image_file') // File input for images

// Listen for when the form is submitted
form.addEventListener('submit', async (e) => {
  e.preventDefault() // Prevent default page reload
  message.textContent = 'Uploading...' // Give user feedback

  let imageUrl = '' // Initialize variable to store image URL if uploaded

  try {
    // Check if the user selected an image
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0] // Get the first selected file

      // Clean filename to remove special characters (so it won't break in storage)
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const fileName = `${Date.now()}_${cleanName}` // Add timestamp to avoid overwriting existing files

      // Upload the file to Supabase storage bucket 'lost-found-images'
      const { error: uploadError } = await supabase.storage
        .from('lost-found-images')
        .upload(fileName, file, { upsert: true }) // 'upsert: true' allows overwriting if same name exists

      if (uploadError) throw uploadError // Stop if upload fails

      // Get a public URL for the uploaded image so it can be displayed on the website
      const { data: publicData, error: urlError } = supabase
        .storage
        .from('lost-found-images')
        .getPublicUrl(fileName)

      if (urlError) throw urlError // Stop if URL retrieval fails

      imageUrl = publicData.publicUrl // Save the public URL for database insertion
    }

    // Gather all form input values into an object
    const itemData = {
      item_name: document.getElementById('item_name').value, // Name of item
      description: document.getElementById('description').value, // Item description
      lost_or_found: document.getElementById('lost_or_found').value, // Lost or Found status
      date: document.getElementById('date').value, // Date of report
      location: document.getElementById('location').value, // Where item was lost/found
      image_url: imageUrl // Image URL (empty if no image)
    }

    // Insert the item data into the Supabase 'lost_found_items' table
    const { data, error } = await supabase
      .from('lost_found_items')
      .insert([itemData]) // Insert as an array (Supabase expects an array)
      .select() // Return the inserted row(s)

    if (error) throw error // Stop if database insert fails

    message.textContent = '✅ Item uploaded successfully!' // Show success message
    form.reset() // Clear the form fields
    loadItems() // Reload items list to include the new entry

  } catch (err) {
    console.error(err) // Log error in console for debugging
    message.textContent = '❌ Error saving item! Contact Admin' // Show error message to user
  }
})

// ---------------- Load Items Function ---------------- //
// Function to fetch items from database and display on the page
async function loadItems() {
  try {
    // Fetch all items from 'lost_found_items' table, ordered newest first
    const { data, error } = await supabase
      .from('lost_found_items')
      .select('*') // Select all columns
      .order('id', { ascending: false }) // Sort by id descending

    if (error) throw error // Stop if fetch fails

    itemsList.innerHTML = '' // Clear previous items from the list

    // Show message if no items are found
    if (!data || data.length === 0) {
      itemsList.innerHTML = '<p>No items found.</p>'
      return
    }

    // Loop through each item and create an HTML card
    data.forEach(item => {
      const div = document.createElement('div')
      div.className = 'item-card' // Add a class for CSS styling

      // Style the card differently based on Lost or Found
      if (item.lost_or_found === 'Lost') {
        div.style.border = '2px solid #e74c3c' // Red border
        div.style.backgroundColor = '#fdecea' // Light red background
      } else if (item.lost_or_found === 'Found') {
        div.style.border = '2px solid #27ae60' // Green border
        div.style.backgroundColor = '#eafaf1' // Light green background
      }

      // Fill the card with item details, including image if available
      div.innerHTML = `
        <h3>${item.lost_or_found} Item</h3>
        <h4>${item.item_name}</h4>
        <p>${item.description || ''}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><i>${item.date ? new Date(item.date).toLocaleDateString() : ''}</i></p>
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.item_name}" style="max-width: 250px; border-radius: 10px;" />` : ''}
      `
      itemsList.appendChild(div) // Add the card to the list
    })

  } catch (err) {
    console.error(err) // Log any errors
    itemsList.innerHTML = '<p>Error loading items.</p>' // Show error message to user
  }
}

// Load items immediately when the page loads
loadItems()
