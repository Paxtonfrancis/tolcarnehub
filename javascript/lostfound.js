// -------------------------------
//  SUPABASE CONFIG
// -------------------------------
const SUPABASE_URL = 'https://yoeydqywoxmslfyxvzkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZXlkcXl3b3htc2xmeXh2emtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODY4MDAsImV4cCI6MjA3NjA2MjgwMH0.5CRg8qdDk_A16u9PCEWw4CCz3AWv7DtHw_mzmoPqhZ8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -------------------------------
//  ELEMENT REFERENCES
// -------------------------------
const form = document.getElementById('lostFoundForm');
const message = document.getElementById('message');
const itemsList = document.getElementById('itemsList');
const fileInput = document.getElementById('image_file');
const dateInput = document.getElementById('date');

// -------------------------------
//  AUTO-FILL TODAY AND RESTRICT DATE PICKER
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('date');

  // Today's date
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // 31 days ago
  const pastLimit = new Date(today);
  pastLimit.setDate(today.getDate() - 31);
  const pastLimitString = pastLimit.toISOString().split('T')[0];

  // Set date picker value and limits
  dateInput.value = todayString;       // auto-fill today
  dateInput.max = todayString;         // block future dates
  dateInput.min = pastLimitString;     // block dates older than 31 days
});


// -------------------------------
//  FORM SUBMIT
// -------------------------------
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0,0,0,0);
    const pastLimit = new Date();
    pastLimit.setDate(today.getDate() - 31);
    pastLimit.setHours(0,0,0,0);

    // Date validation
    if (inputDate > today) {
        message.textContent = '❌ Date cannot be in the future.';
        return;
    }
    if (inputDate < pastLimit) {
        message.textContent = '❌ Date must be within the last 31 days.';
        return;
    }

    message.textContent = 'Uploading...';
    let imageUrl = '';

    try {
        // Upload image if selected
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const fileName = `${Date.now()}_${cleanName}`;

            const { error: uploadError } = await supabase.storage
                .from('lost-found-images')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicData, error: urlError } = supabase
                .storage
                .from('lost-found-images')
                .getPublicUrl(fileName);

            if (urlError) throw urlError;

            imageUrl = publicData.publicUrl;
        }

        const itemData = {
            item_name: document.getElementById('item_name').value,
            description: document.getElementById('description').value,
            lost_or_found: document.getElementById('lost_or_found').value,
            date: dateInput.value,
            location: document.getElementById('location').value,
            image_url: imageUrl
        };

        const { data, error } = await supabase
            .from('lost_found_items')
            .insert([itemData])
            .select();

        if (error) throw error;

        message.textContent = '✅ Item uploaded successfully!';
        form.reset();
        // Refill date with today after reset
        dateInput.value = new Date().toISOString().split('T')[0];
        loadItems();

    } catch (err) {
        console.error(err);
        message.textContent = '❌ Error saving item! Contact Admin';
    }
});

// -------------------------------
//  LOAD ITEMS FUNCTION
// -------------------------------
async function loadItems() {
    try {
        const { data, error } = await supabase
            .from('lost_found_items')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        itemsList.innerHTML = '';

        if (!data || data.length === 0) {
            itemsList.innerHTML = '<p>No items found.</p>';
            return;
        }

        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'item-card';

            if (item.lost_or_found === 'Lost') {
                div.style.border = '2px solid #e74c3c';
                div.style.backgroundColor = '#fdecea';
            } else if (item.lost_or_found === 'Found') {
                div.style.border = '2px solid #27ae60';
                div.style.backgroundColor = '#eafaf1';
            }

            div.innerHTML = `
                <h3>${item.lost_or_found} Item</h3>
                <h4>${item.item_name}</h4>
                <p>${item.description || ''}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><i>${item.date ? new Date(item.date).toLocaleDateString() : ''}</i></p>
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.item_name}" style="max-width: 250px; border-radius: 10px;" />` : ''}
            `;

            itemsList.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        itemsList.innerHTML = '<p>Error loading items.</p>';
    }
}

// Load items immediately when page loads
loadItems();
