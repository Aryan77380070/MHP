// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadLocations();
  
  // Set default radio button selections
  document.querySelectorAll('.switch-field input[type="radio"][checked]').forEach(radio => {
      radio.checked = true;
  });
});

// Load locations from backend
function loadLocations() {
  fetch("http://127.0.0.1:5000/get_location_names")
      .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
      })
      .then(data => {
          const select = document.getElementById('uiLocations');
          data.locations.forEach(location => {
              const option = document.createElement('option');
              option.value = location;
              option.textContent = location;
              select.appendChild(option);
          });
      })
      .catch(error => {
          console.error('Error loading locations:', error);
          document.getElementById('uiLocations').innerHTML = 
              '<option value="">Error loading locations</option>';
      });
}

// Get selected radio button value
function getSelectedValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : null;
}

// Format price in Indian numbering system
function formatPrice(price) {
  const amount = parseFloat(price);
  if (isNaN(amount)) return '₹0';

  if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Crores`;
  }
  if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Main estimation function
function onClickedEstimatePrice() {
  try {
      // Get all input values
      const inputs = {
          area: document.getElementById('uiarea').value,
          location: document.getElementById('uiLocations').value,
          bhk: getSelectedValue('uiBHK'),
          new: getSelectedValue('uinew'),
          gym: getSelectedValue('uigym'),
          lift: getSelectedValue('uilift'),
          car: getSelectedValue('uicar'),
          gas: getSelectedValue('uigas'),
          pool: getSelectedValue('uipool')
      };

      // Validate inputs
      if (!inputs.area || isNaN(inputs.area)) {
          throw new Error('Please enter a valid area');
      }
      if (!inputs.location) {
          throw new Error('Please select a location');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('Area', inputs.area);
      formData.append('Location', inputs.location);
      formData.append('bhk', inputs.bhk);
      formData.append('New_or_Resale', inputs.new);
      formData.append('Gymnasium', inputs.gym);
      formData.append('Lift_Available', inputs.lift);
      formData.append('Car_Parking', inputs.car);
      formData.append('Gas_Connection', inputs.gas);
      formData.append('Swimming_Pool', inputs.pool);

      // Make API request
      fetch('http://127.0.0.1:5000/predict_home_price', {
          method: 'POST',
          body: formData
      })
      .then(response => {
          if (!response.ok) throw new Error('Prediction failed');
          return response.json();
      })
      .then(data => {
          document.getElementById('uiEstimatedPrice').innerHTML = 
              `<h2>${formatPrice(data.estimated_price)}</h2>`;
      })
      .catch(error => {
          console.error('Error:', error);
          document.getElementById('uiEstimatedPrice').innerHTML = 
              `<h2 style="color: red;">Error: ${error.message}</h2>`;
      });

  } catch (error) {
      console.error('Validation error:', error);
      document.getElementById('uiEstimatedPrice').innerHTML = 
          `<h2 style="color: red;">${error.message}</h2>`;
  }
}