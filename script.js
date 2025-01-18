// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com", 
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Data synchronization functions
function syncDataToFirebase() {
  const data = {
    cuentas: JSON.parse(localStorage.getItem('cuentas') || '[]'),
    documentos: JSON.parse(localStorage.getItem('documentos') || '[]'),
    centros: JSON.parse(localStorage.getItem('centros') || '[]'),
    transacciones: JSON.parse(localStorage.getItem('transacciones') || '[]'),
    parametros: JSON.parse(localStorage.getItem('parametrosOratorio') || '{}')
  };

  // Save data to Firebase
  database.ref('oratorioData').set(data)
    .then(() => {
      console.log('Data synced successfully');
    })
    .catch((error) => {
      console.error('Sync error:', error);
    });
}

function loadDataFromFirebase() {
  database.ref('oratorioData').once('value')
    .then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        localStorage.setItem('cuentas', JSON.stringify(data.cuentas || []));
        localStorage.setItem('documentos', JSON.stringify(data.documentos || []));
        localStorage.setItem('centros', JSON.stringify(data.centros || []));
        localStorage.setItem('transacciones', JSON.stringify(data.transacciones || []));
        localStorage.setItem('parametrosOratorio', JSON.stringify(data.parametros || {}));
        
        // Update UI
        actualizarCatalogo();
        actualizarTablaDocumentos();
        actualizarTablaTransacciones();
        actualizarTablaCentros();
        cargarParametros();
      }
    })
    .catch((error) => {
      console.error('Error loading data:', error);
    });
}

// Listen for real-time updates
function initializeRealtimeSync() {
  database.ref('oratorioData').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      localStorage.setItem('cuentas', JSON.stringify(data.cuentas || []));
      localStorage.setItem('documentos', JSON.stringify(data.documentos || []));
      localStorage.setItem('centros', JSON.stringify(data.centros || []));
      localStorage.setItem('transacciones', JSON.stringify(data.transacciones || []));
      localStorage.setItem('parametrosOratorio', JSON.stringify(data.parametros || {}));
      
      // Update UI only if user is logged in
      if (currentUser) {
        actualizarCatalogo();
        actualizarTablaDocumentos();
        actualizarTablaTransacciones();
        actualizarTablaCentros();
        cargarParametros();
      }
    }
  });
}

// Modify existing functions to sync with Firebase
function guardarCuenta() {
  // ... existing code ...
  localStorage.setItem('cuentas', JSON.stringify(cuentas));
  syncDataToFirebase(); // Add sync after saving
  actualizarCatalogo();
  // ... rest of the code ...
}

function guardarTransaccion() {
  // ... existing code ...
  localStorage.setItem('transacciones', JSON.stringify(transacciones));
  syncDataToFirebase(); // Add sync after saving
  actualizarTablaTransacciones();
  // ... rest of the code ...
}

function guardarDocumento() {
  // ... existing code ...
  localStorage.setItem('documentos', JSON.stringify(documentos));
  syncDataToFirebase(); // Add sync after saving
  actualizarTablaDocumentos();
  // ... rest of the code ...
}

function guardarCentro() {
  // ... existing code ...
  localStorage.setItem('centros', JSON.stringify(centros));
  syncDataToFirebase(); // Add sync after saving
  actualizarTablaCentros();
  // ... rest of the code ...
}

function guardarParametros() {
  // ... existing code ...
  localStorage.setItem('parametrosOratorio', JSON.stringify(parametros));
  syncDataToFirebase(); // Add sync after saving
  // ... rest of the code ...
}

// Modify login function to load data after successful login
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const user = USERS[username];
  
  if (user && user.password === password) {
    currentUser = {
      username,
      role: user.role
    };
    
    // Load data from Firebase after successful login
    loadDataFromFirebase();
    initializeRealtimeSync();
    
    document.getElementById('loginContainer').style.display = 'none';
    document.querySelector('.container-fluid').style.display = 'block';
    
    if (user.role === 'colaborador') {
      const restrictedMenus = ['catalogo', 'centrosCosto', 'documentos', 'parametros'];
      restrictedMenus.forEach(menu => {
        document.querySelector(`[onclick="showSection('${menu}')"]`).style.display = 'none';
      });
    }
    
    showSection('transacciones');
  } else {
    alert('Usuario o contraseña incorrectos');
  }
}

// Modify logout to clean up Firebase listeners
function logout() {
  currentUser = null;
  // Remove Firebase listeners
  database.ref('oratorioData').off();
  document.getElementById('loginContainer').style.display = 'block';
  document.querySelector('.container-fluid').style.display = 'none';
  document.getElementById('loginForm').reset();
}

// Add Firebase sync to backup/restore functions
function crearBackup() {
  const backup = {
    cuentas: JSON.parse(localStorage.getItem('cuentas') || '[]'),
    documentos: JSON.parse(localStorage.getItem('documentos') || '[]'),
    centros: JSON.parse(localStorage.getItem('centros') || '[]'),
    transacciones: JSON.parse(localStorage.getItem('transacciones') || '[]'),
    parametros: JSON.parse(localStorage.getItem('parametrosOratorio') || '{}'),
    timestamp: new Date().toISOString()
  };
  
  // Save backup to Firebase
  database.ref('backups/' + new Date().toISOString().replace(/[.]/g, '_'))
    .set(backup)
    .then(() => {
      console.log('Backup saved to Firebase');
    })
    .catch((error) => {
      console.error('Backup error:', error);
    });

  // Create local backup file
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_sistema_contable_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', function() {
  // Create stars background
  const stars = document.querySelector('.stars');
  for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.style.position = 'absolute';
    star.style.width = '2px';
    star.style.height = '2px';
    star.style.background = 'white';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.opacity = Math.random();
    star.style.animation = `twinkle ${Math.random() * 3 + 1}s infinite`;
    stars.appendChild(star);
  }

  // Create rosary beads
  const rosaryBeads = document.querySelector('.rosary-beads');
  const totalBeads = 50;
  const radius = 80;
  
  for (let i = 0; i < totalBeads; i++) {
    const bead = document.createElement('div');
    const angle = (i / totalBeads) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    bead.style.position = 'absolute';
    bead.style.width = '8px';
    bead.style.height = '8px';
    bead.style.background = '#FFD700';
    bead.style.borderRadius = '50%';
    bead.style.left = `${x + radius}px`;
    bead.style.top = `${y + radius}px`;
    
    rosaryBeads.appendChild(bead);
  }

  // Add divine light animation
  const divineLight = document.querySelector('.divine-light');
  document.addEventListener('mousemove', (e) => {
    const rect = divineLight.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divineLight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,215,0,0.2), transparent 70%)`;
  });
});

// Add CSS animation for twinkling stars
const style = document.createElement('style');
style.textContent = `
  @keyframes twinkle {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 1; }
  }
`;
document.head.appendChild(style);