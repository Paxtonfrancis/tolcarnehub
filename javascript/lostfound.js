// -------------------------------
//  LOST & FOUND FORM JAVASCRIPT
// -------------------------------

// Auto-fill today's date AND prevent dates older than 31 days
document.addEventListener('DOMContentLoaded', function () {
  const dateInput = document.getElementById('date_found');

  // Get today's date
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // Calculate 31 days ago
  const pastLimit = new Date(today);
  pastLimit.setDate(pastLimit.getDate() - 31);
  const pastLimitString = pastLimit.toISOString().split("T")[0];

  // Auto-fill today's date
  dateInput.value = todayString;

  // Set allowed range
  dateInput.max = todayString;
  dateInput.min = pastLimitString;
});


// -------------------------------
//  SUPABASE CONFIG
// -------------------------------
const SUPABASE_URL = "YOUR PROJECT URL HERE";
const SUPABASE_KEY = "YOUR ANON KEY HERE";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// -------------------------------
//  IMAGE FILENAME CLEANER
// -------------------------------
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}


// -------------------------------
//  FORM SUBMIT LOGIC
// -------------------------------
document.getElementById("itemForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const itemName = document.getElementById("itemName").value;
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;
  const dateFound = document.getElementById("date_found").value;
  const imageFile = document.getElementById("image").files[0];

  let imageUrl = null;

  // Upload image if there is one
  if (imageFile) {
      const cleanName = sanitizeFilename(imageFile.name);

      const { data: imageData, error: imageError } = await supabaseClient.storage
          .from("lost-and-found")
          .upload(cleanName, imageFile);

      if (imageError) {
          alert("Error uploading image!");
          return;
      }

      imageUrl = `${SUPABASE_URL}/storage/v1/object/public/lost-and-found/${cleanName}`;
  }

  // Insert record into database
  const { data, error } = await supabaseClient
      .from("LostAndFound")
      .insert([
          {
              item_name: itemName,
              description: description,
              location_found: location,
              date_found: dateFound,
              image_url: imageUrl
          }
      ]);

  if (error) {
      console.log(error);
      alert("❌ Error saving item! Contact Admin");
  } else {
      alert("✅ Item uploaded successfully!");
      document.getElementById("itemForm").reset();
      document.getElementById("date_found").value = new Date().toISOString().split("T")[0];
  }
});
