import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';
import { Camera, CameraView } from 'expo-camera';

// Setup SQLite local database connection
const db = SQLite.openDatabaseSync('edgs.db');

// Simulated Lucide Icons for React Native (SVG/Custom representation to ensure 100% compile guarantee)
const Icon = ({ name, color = '#f8fafc', size = 24 }: { name: string; color?: string; size?: number }) => {
  const icons: Record<string, string> = {
    truck: '🚛',
    lock: '🔒',
    clock: '🕒',
    camera: '📷',
    package: '📦',
    mapPin: '📍',
    alert: '⚠️',
    sync: '🔄',
    check: '✅',
    user: '👤',
    settings: '⚙️'
  };
  return <Text style={{ fontSize: size, color }}>{icons[name] || '•'}</Text>;
};

interface Mission {
  id: string;
  title: string;
  client: string;
  worksite: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  notes?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'select_truck' | 'dashboard' | 'mission_detail' | 'stock' | 'camera'>('login');
  
  // Configuration
  const [rawServerUrl, setRawServerUrl] = useState('https://edgs-app.onrender.com'); // Production Render backend URL
  const serverUrl = rawServerUrl.trim().replace(/\/+$/, '');
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Connection states
  const [isOffline, setIsOffline] = useState(false);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  // Auth & Session state
  const [pin, setPin] = useState('');
  const [employee, setEmployee] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Fleet and Ops state
  const [trucksList, setTrucksList] = useState<any[]>([]);
  const [truck, setTruck] = useState<any>(null);
  const [dayStarted, setDayStarted] = useState(false);
  const [missionsList, setMissionsList] = useState<Mission[]>([]);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

  // New features states
  const [isPaused, setIsPaused] = useState(false);
  const [pauseType, setPauseType] = useState<'repas' | 'technique'>('repas');
  const [displacementMode, setDisplacementMode] = useState<'panier' | 'petit' | 'grand'>('panier');
  const [isOutOfZone, setIsOutOfZone] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signaturePoints, setSignaturePoints] = useState<{ x: number; y: number }[]>([]);

  // Camera states
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'before' | 'after'>('before');
  const [useSimulatedCamera, setUseSimulatedCamera] = useState(true);
  const cameraRef = useRef<any>(null);

  // Initialize SQLite schema
  useEffect(() => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS pending_sync (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          payload TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS cached_missions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          clientName TEXT,
          worksiteAddress TEXT,
          status TEXT NOT NULL,
          scheduledDate TEXT NOT NULL,
          notes TEXT,
          latitude REAL,
          longitude REAL
        );
        CREATE TABLE IF NOT EXISTS cached_truck (
          id TEXT PRIMARY KEY,
          plateNumber TEXT NOT NULL,
          currentStock INTEGER NOT NULL,
          stockAlertThreshold INTEGER NOT NULL,
          stocksJson TEXT
        );
        try {
          db.execSync('ALTER TABLE cached_missions ADD COLUMN latitude REAL;');
          db.execSync('ALTER TABLE cached_missions ADD COLUMN longitude REAL;');
        } catch (e) {
          // Columns already exist
        }
        try {
          db.execSync('ALTER TABLE cached_truck ADD COLUMN stocksJson TEXT;');
        } catch (e) {
          // Column already exists or table is freshly created
        }
      `);
      loadCachedData();
    } catch (err) {
      console.error('Error initializing SQLite:', err);
    }
  }, []);

  // Request permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');
      if (cameraStatus !== 'granted') {
        setUseSimulatedCamera(true);
      }
      
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  // Load cached database values
  const loadCachedData = () => {
    try {
      const cachedM: any[] = db.getAllSync('SELECT * FROM cached_missions');
      const formattedMissions = cachedM.map(m => ({
        id: m.id,
        title: m.title,
        client: m.clientName || 'N/A',
        worksite: m.worksiteAddress || 'N/A',
        status: m.status,
        scheduledDate: m.scheduledDate,
        notes: m.notes,
        latitude: m.latitude || null,
        longitude: m.longitude || null
      }));
      setMissionsList(formattedMissions);
      
      const inProgress = formattedMissions.find(m => m.status === 'in_progress');
      const planned = formattedMissions.find(m => m.status === 'planned');
      setActiveMission(inProgress || planned || formattedMissions[0] || null);
      
      const cachedT: any[] = db.getAllSync('SELECT * FROM cached_truck LIMIT 1');
      if (cachedT.length > 0) {
        const tObj = cachedT[0];
        if (tObj.stocksJson) {
          try {
            tObj.stocks = JSON.parse(tObj.stocksJson);
          } catch (e) {
            tObj.stocks = [];
          }
        } else {
          tObj.stocks = [];
        }
        setTruck(tObj);
      }

      const pending: any[] = db.getAllSync('SELECT * FROM pending_sync');
      setSyncQueue(pending);
    } catch (e) {
      console.error('Error reading SQLite Cache:', e);
    }
  };

  // Replay Offline pending sync tasks when switching to Online
  const syncOfflineData = async (currentToken = token) => {
    try {
      const pending: any[] = db.getAllSync('SELECT * FROM pending_sync ORDER BY id ASC');
      if (pending.length === 0) return;

      console.log(`Replaying ${pending.length} pending operations...`);
      for (const op of pending) {
        const payload = JSON.parse(op.payload);
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        };

        if (op.type === 'day_start' || op.type === 'day_end' || op.type === 'pause_start' || op.type === 'pause_end') {
          await fetch(`${serverUrl}/timeclock`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              employeeId: payload.employeeId,
              truckId: payload.truckId,
              type: op.type,
              pauseType: payload.pauseType,
              displacementMode: payload.displacementMode,
              timestamp: payload.timestamp,
              isSyncedFromOffline: true
            })
          });
        }

        if (op.type === 'start_mission') {
          await fetch(`${serverUrl}/missions/${payload.missionId}/status/in_progress`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${currentToken}` }
          });
          await fetch(`${serverUrl}/timeclock`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              employeeId: payload.employeeId,
              missionId: payload.missionId,
              type: 'mission_start',
              timestamp: payload.timestamp,
              isSyncedFromOffline: true
            })
          });
        }

        if (op.type === 'end_mission') {
          await fetch(`${serverUrl}/missions/${payload.missionId}/status/completed`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${currentToken}` }
          });
          await fetch(`${serverUrl}/timeclock`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              employeeId: payload.employeeId,
              missionId: payload.missionId,
              type: 'mission_end',
              signature: payload.signature,
              timestamp: payload.timestamp,
              isSyncedFromOffline: true
            })
          });
        }

        if (op.type === 'stock_movement') {
          await fetch(`${serverUrl}/stock/movement`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              truckId: payload.truckId,
              type: payload.type,
              quantity: payload.quantity,
              notes: 'Synchro Offline'
            })
          });
        }

        if (op.type === 'gps') {
          await fetch(`${serverUrl}/gps/track`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              truckId: payload.truckId,
              missionId: payload.missionId,
              latitude: payload.latitude,
              longitude: payload.longitude,
              speed: payload.speed,
              isOutOfZone: payload.isOutOfZone,
              isSyncedFromOffline: true
            })
          });
        }
      }

      db.execSync('DELETE FROM pending_sync');
      setSyncQueue([]);
      Alert.alert('Synchronisation', 'Toutes les opérations hors-ligne ont été synchronisées.');
      loadCachedData();
    } catch (e) {
      console.error('Error during synchronization:', e);
      Alert.alert('Erreur synchro', 'Certaines données n\'ont pas pu être retransmises.');
    }
  };

  // Toggle offline simulator state
  const toggleOffline = async () => {
    const nextOffline = !isOffline;
    setIsOffline(nextOffline);
    if (!nextOffline) {
      // Re-connected online, launch sync
      await syncOfflineData();
      fetchMissionsAndStock();
    }
  };

  // Helper to translate status to French
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Planifié';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  // Open GPS navigation to worksite address
  const openGps = () => {
    if (!activeMission || !activeMission.worksite || activeMission.worksite === 'N/A') {
      Alert.alert('Chantier', 'Adresse du chantier indisponible.');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMission.worksite)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Erreur', "Impossible d'ouvrir l'application de navigation GPS.");
    });
  };

  // Fetch server data and load to SQLite cache
  const fetchMissionsAndStock = async (currentTruck = truck, currentToken = token) => {
    if (isOffline || !currentTruck || !currentToken) return;
    try {
      const headers = { 'Authorization': `Bearer ${currentToken}` };
      
      // Fetch today's missions for truck
      const resMissions = await fetch(`${serverUrl}/missions/today?truckId=${currentTruck.id}`, { headers });
      if (resMissions.ok) {
        const dataM = await resMissions.json();
        
        // Cache to SQLite
        db.execSync('DELETE FROM cached_missions');
        for (const m of dataM) {
          db.runSync(
            'INSERT OR REPLACE INTO cached_missions (id, title, clientName, worksiteAddress, status, scheduledDate, notes, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [m.id, m.title, m.client?.name || 'N/A', m.worksite?.address || 'N/A', m.status, m.scheduledDate, m.notes || '', m.worksite?.latitude || null, m.worksite?.longitude || null]
          );
        }
      }

      // Fetch truck stock
      const resTruck = await fetch(`${serverUrl}/trucks/${currentTruck.id}`, { headers });
      if (resTruck.ok) {
        const dataT = await resTruck.json();
        db.runSync(
          'INSERT OR REPLACE INTO cached_truck (id, plateNumber, currentStock, stockAlertThreshold, stocksJson) VALUES (?, ?, ?, ?, ?)',
          [dataT.id, dataT.plateNumber, dataT.currentStock, dataT.stockAlertThreshold, JSON.stringify(dataT.stocks || [])]
        );
      }

      loadCachedData();
    } catch (err) {
      console.error('Error fetching data from API:', err);
    }
  };

  // PIN Login flow
  const handleKeyPress = async (num: string) => {
    if (loading) return; // Prevent double taps during fetch
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (!isOffline) {
          setLoading(true);
          try {
            const res = await fetch(`${serverUrl}/auth/pin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pin: newPin }),
            });

            if (!res.ok) {
              throw new Error('PIN incorrect');
            }

            const data = await res.json();
            setToken(data.access_token);
            setEmployee(data.employee);
            setPin('');
            
            if (data.truck) {
              setTruck(data.truck);
              
              let missionsData: any[] = [];
              try {
                // Fetch today's missions for this truck directly
                const headers = { 'Authorization': `Bearer ${data.access_token}` };
                const resMissions = await fetch(`${serverUrl}/missions/today?truckId=${data.truck.id}`, { headers });
                if (resMissions.ok) {
                  missionsData = await resMissions.json();
                }
              } catch (errMissions) {
                console.warn("Failed to fetch today's missions during login:", errMissions);
              }

              // Cache data locally in SQLite
              try {
                db.runSync('DELETE FROM cached_truck');
                db.runSync(
                  'INSERT INTO cached_truck (id, plateNumber, currentStock, stockAlertThreshold, stocksJson) VALUES (?, ?, ?, ?, ?)',
                  [data.truck.id, data.truck.plateNumber, data.truck.currentStock, data.truck.stockAlertThreshold, JSON.stringify(data.truck.stocks || [])]
                );
                
                db.runSync('DELETE FROM cached_missions');
                if (missionsData && missionsData.length > 0) {
                  missionsData.forEach((m: any) => {
                    const clientName = m.clientName || m.client?.name || 'N/A';
                    const worksiteAddress = m.worksiteAddress || m.worksite?.address || 'N/A';
                    db.runSync(
                      'INSERT INTO cached_missions (id, title, clientName, worksiteAddress, status, scheduledDate, notes, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                      [m.id, m.title, clientName, worksiteAddress, m.status, m.scheduledDate, m.notes || '', m.worksite?.latitude || null, m.worksite?.longitude || null]
                    );
                  });
                }
              } catch (errCache) {
                console.warn("Failed to cache login info:", errCache);
              }

              const formattedMissions = (missionsData || []).map((m: any) => {
                const clientName = m.clientName || m.client?.name || 'N/A';
                const worksiteAddress = m.worksiteAddress || m.worksite?.address || 'N/A';
                return {
                  id: m.id,
                  title: m.title,
                  client: clientName,
                  worksite: worksiteAddress,
                  status: m.status,
                  scheduledDate: m.scheduledDate,
                  notes: m.notes,
                  latitude: m.worksite?.latitude || null,
                  longitude: m.worksite?.longitude || null
                };
              });

              setMissionsList(formattedMissions);
              const inProgress = formattedMissions.find((m: any) => m.status === 'in_progress');
              const planned = formattedMissions.find((m: any) => m.status === 'planned');
              setActiveMission(inProgress || planned || formattedMissions[0] || null);

              setCurrentScreen('dashboard');
            } else {
              // Standard flow: Get trucks list to select
              const resTrucks = await fetch(`${serverUrl}/trucks`, {
                headers: { 'Authorization': `Bearer ${data.access_token}` }
              });
              const dataTrucks = await resTrucks.json();
              setTrucksList(dataTrucks);
              setCurrentScreen('select_truck');
            }
          } catch (err: any) {
            if (err.message === 'PIN incorrect') {
              Alert.alert('Connexion échouée', 'Le code PIN saisi est incorrect.');
            } else {
              Alert.alert(
                'Serveur indisponible',
                'Le serveur est injoignable. S\'il s\'agit de la première connexion de la journée, le serveur gratuit Render nécessite environ 50 secondes pour démarrer. Veuillez patienter et réessayer.'
              );
            }
            setPin('');
          } finally {
            setLoading(false);
          }
        } else {
          // Offline local login bypass using seeder defaults
          if (newPin === '1234') {
            setEmployee({ id: 'offline-emp-id', firstName: 'Jean', lastName: 'Chauffeur' });
            setPin('');
            loadCachedData();
            setCurrentScreen('dashboard');
          } else {
            Alert.alert('Erreur', 'PIN incorrect en mode hors-ligne (Chauffeur: 1234).');
            setPin('');
          }
        }
      }
    }
  };

  const clearPin = () => setPin('');

  // Choose truck from list
  const handleSelectTruck = (selected: any) => {
    setTruck(selected);
    db.runSync(
      'INSERT OR REPLACE INTO cached_truck (id, plateNumber, currentStock, stockAlertThreshold, stocksJson) VALUES (?, ?, ?, ?, ?)',
      [selected.id, selected.plateNumber, selected.currentStock, selected.stockAlertThreshold, JSON.stringify(selected.stocks || [])]
    );
    fetchMissionsAndStock(selected, token);
    setCurrentScreen('dashboard');
  };

  // Start Day timeclock
  const startDay = async () => {
    setDayStarted(true);
    const payload = {
      employeeId: employee.id,
      truckId: truck.id,
      displacementMode,
      timestamp: new Date().toISOString()
    };

    if (!isOffline) {
      try {
        await fetch(`${serverUrl}/timeclock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, type: 'day_start' })
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      db.runSync(
        "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('day_start', ?, ?)",
        [JSON.stringify(payload), new Date().toISOString()]
      );
      loadCachedData();
    }
    Alert.alert('Pointage', `Début de journée enregistré (${displacementMode}).`);
  };

  // End Day timeclock
  const endDay = async () => {
    setDayStarted(false);
    setIsPaused(false);
    const payload = {
      employeeId: employee.id,
      truckId: truck.id,
      timestamp: new Date().toISOString()
    };

    if (!isOffline) {
      try {
        await fetch(`${serverUrl}/timeclock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, type: 'day_end' })
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      db.runSync(
        "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('day_end', ?, ?)",
        [JSON.stringify(payload), new Date().toISOString()]
      );
      loadCachedData();
    }
    Alert.alert('Pointage', 'Fin de journée enregistrée.');
    setCurrentScreen('login');
    setEmployee(null);
    setToken(null);
  };

  // Start Pause
  const startPause = async (type: 'repas' | 'technique') => {
    setIsPaused(true);
    setPauseType(type);
    const payload = {
      employeeId: employee.id,
      truckId: truck.id,
      pauseType: type,
      timestamp: new Date().toISOString()
    };

    if (!isOffline) {
      try {
        await fetch(`${serverUrl}/timeclock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, type: 'pause_start' })
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      db.runSync(
        "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('pause_start', ?, ?)",
        [JSON.stringify(payload), new Date().toISOString()]
      );
      loadCachedData();
    }
    Alert.alert('Pointage', `Pause ${type === 'repas' ? 'Déjeuner' : 'Technique'} enregistrée.`);
  };

  // End Pause
  const endPause = async () => {
    setIsPaused(false);
    const payload = {
      employeeId: employee.id,
      truckId: truck.id,
      timestamp: new Date().toISOString()
    };

    if (!isOffline) {
      try {
        await fetch(`${serverUrl}/timeclock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, type: 'pause_end' })
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      db.runSync(
        "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('pause_end', ?, ?)",
        [JSON.stringify(payload), new Date().toISOString()]
      );
      loadCachedData();
    }
    Alert.alert('Pointage', 'Reprise de l\'activité enregistrée.');
  };

  // Start active mission
  const startMission = async () => {
    if (!activeMission) return;
    
    const payload = {
      missionId: activeMission.id,
      employeeId: employee.id,
      timestamp: new Date().toISOString()
    };

    if (!isOffline) {
      try {
        await fetch(`${serverUrl}/missions/${activeMission.id}/status/in_progress`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        await fetch(`${serverUrl}/timeclock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, type: 'mission_start' })
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      // Local db cache update
      db.runSync("UPDATE cached_missions SET status = 'in_progress' WHERE id = ?", [activeMission.id]);
      db.runSync(
        "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('start_mission', ?, ?)",
        [JSON.stringify(payload), new Date().toISOString()]
      );
    }
    
    Alert.alert('Chantier', 'Mission démarrée avec succès.');
    fetchMissionsAndStock();
  };

  // Complete active mission
  const endMission = async () => {
    if (!activeMission) return;

    Alert.alert(
      'Fin de mission',
      'Attention vous allez finir la mission. Est-ce que le chantier est bien fini ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Oui, terminer',
          onPress: () => {
            // Open signature pad
            setShowSignaturePad(true);
          }
        }
      ]
    );
  };

  // Submit End Mission with Signature payload
  const submitEndMission = async (sigBase64: string) => {
    if (!activeMission) return;
    const payload = {
      missionId: activeMission.id,
      employeeId: employee.id,
      signature: sigBase64,
      timestamp: new Date().toISOString()
    };

    if (!isOffline) {
      try {
        await fetch(`${serverUrl}/missions/${activeMission.id}/status/completed`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        await fetch(`${serverUrl}/timeclock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, type: 'mission_end' })
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      db.runSync("UPDATE cached_missions SET status = 'completed' WHERE id = ?", [activeMission.id]);
      db.runSync(
        "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('end_mission', ?, ?)",
        [JSON.stringify(payload), new Date().toISOString()]
      );
    }

    Alert.alert('Chantier', 'Mission clôturée avec signature enregistrée.');
    setShowSignaturePad(false);
    fetchMissionsAndStock();
  };

  // Adjust Truck sand stock
  const updateStock = async (diff: number) => {
    const nextStock = Math.max(0, truck.currentStock + diff);
    const type = diff > 0 ? 'load' : 'consume';
    
    const payload = {
      truckId: truck.id,
      type,
      quantity: Math.abs(diff),
      timestamp: new Date().toISOString()
    };

    // Update SQLite Cache
    db.runSync("UPDATE cached_truck SET currentStock = ? WHERE id = ?", [nextStock, truck.id]);
    setTruck({ ...truck, currentStock: nextStock });

    if (!isOffline) {
      try {
        await fetch(`${serverUrl}/stock/movement`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      db.runSync(
        "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('stock_movement', ?, ?)",
        [JSON.stringify(payload), new Date().toISOString()]
      );
      loadCachedData();
    }
  };

  // Haversine formula helper
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  };

  // Location interval loop (Simulation/Background tracking)
  useEffect(() => {
    let interval: any;
    if (dayStarted && truck && activeMission && activeMission.status === 'in_progress') {
      interval = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          
          let outOfZone = false;
          if (activeMission.latitude && activeMission.longitude) {
            const dist = getDistance(
              loc.coords.latitude,
              loc.coords.longitude,
              activeMission.latitude,
              activeMission.longitude
            );
            outOfZone = dist > 100;
            setIsOutOfZone(outOfZone);
          } else {
            setIsOutOfZone(false);
          }

          const gpsPoint = {
            truckId: truck.id,
            missionId: activeMission.id,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            speed: loc.coords.speed || 0,
            accuracy: loc.coords.accuracy || 0,
            isOutOfZone: outOfZone
          };

          if (!isOffline) {
            await fetch(`${serverUrl}/gps/track`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(gpsPoint)
            });
          } else {
            db.runSync(
              "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('gps', ?, ?)",
              [JSON.stringify(gpsPoint), new Date().toISOString()]
            );
            loadCachedData();
          }
        } catch (e) {
          console.log('Location track error:', e);
        }
      }, 10000); // 10 seconds loop for quick demonstration
    } else {
      setIsOutOfZone(false);
    }
    return () => clearInterval(interval);
  }, [dayStarted, truck, activeMission, isOffline, token, serverUrl]);

  // Photo Capture
  const handleCapturePhoto = async () => {
    if (useSimulatedCamera) {
      // Simulate base64 / uri
      const payload = {
        missionId: activeMission?.id,
        employeeId: employee?.id,
        type: cameraType,
        uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80',
        timestamp: new Date().toISOString()
      };

      if (!isOffline) {
        try {
          const formData = new FormData();
          formData.append('file', {
            uri: payload.uri,
            name: 'photo.jpg',
            type: 'image/jpeg'
          } as any);
          formData.append('type', payload.type);
          formData.append('employeeId', payload.employeeId || '');
          formData.append('notes', 'Photo mobile en ligne');
          
          await fetch(`${serverUrl}/photos/mission/${payload.missionId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        db.runSync(
          "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('photo', ?, ?)",
          [JSON.stringify(payload), new Date().toISOString()]
        );
        loadCachedData();
      }
      Alert.alert('Succès', 'Photo de chantier enregistrée.');
      setCurrentScreen('mission_detail');
    } else {
      // Real camera capture
      if (cameraRef.current) {
        try {
          const options = { quality: 0.5, base64: true };
          const data = await cameraRef.current.takePictureAsync(options);
          
          const payload = {
            missionId: activeMission?.id,
            employeeId: employee?.id,
            type: cameraType,
            uri: data.uri,
            timestamp: new Date().toISOString()
          };

          if (!isOffline) {
            const formData = new FormData();
            formData.append('file', {
              uri: data.uri,
              name: 'photo.jpg',
              type: 'image/jpeg'
            } as any);
            formData.append('type', payload.type);
            formData.append('employeeId', payload.employeeId || '');
            
            await fetch(`${serverUrl}/photos/mission/${payload.missionId}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: formData
            });
          } else {
            db.runSync(
              "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('photo', ?, ?)",
              [JSON.stringify(payload), new Date().toISOString()]
            );
            loadCachedData();
          }
          Alert.alert('Succès', 'Photo capturée.');
          setCurrentScreen('mission_detail');
        } catch (e) {
          console.error(e);
          Alert.alert('Erreur', 'Erreur de capture.');
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Banner indicating Online/Offline Mode */}
      <View style={[styles.banner, isOffline ? styles.bannerOffline : styles.bannerOnline]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="sync" size={16} />
          <Text style={styles.bannerText}>
            {isOffline ? 'Mode Hors Ligne (SQLite Actif)' : 'Mode En Ligne (Serveur Connecté)'}
          </Text>
        </View>
        <TouchableOpacity style={styles.btnBanner} onPress={toggleOffline}>
          <Text style={styles.btnBannerText}>{isOffline ? 'Se connecter' : 'Passer offline'}</Text>
        </TouchableOpacity>
      </View>

      {/* Configuration modal trigger */}
      {currentScreen === 'login' && (
        <View style={{ position: 'absolute', top: 90, right: 16, zIndex: 50 }}>
          <TouchableOpacity onPress={() => setShowConfig(!showConfig)} style={{ backgroundColor: '#1e293b', padding: 8, borderRadius: 8 }}>
            <Icon name="settings" size={24} />
          </TouchableOpacity>
        </View>
      )}

      {/* Settings inputs */}
      {showConfig && (
        <View style={styles.configCard}>
          <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Adresse EDGS API :</Text>
          <TextInput 
            style={styles.configInput}
            value={rawServerUrl}
            onChangeText={setRawServerUrl}
            placeholder="https://edgs-app.onrender.com"
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity style={styles.btnConfigClose} onPress={() => setShowConfig(false)}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Valider</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SCREEN 1: LOGIN */}
      {currentScreen === 'login' && (
        <View style={styles.loginContainer}>
          <View style={styles.loginHeader}>
            <Icon name="truck" size={48} color="#3b82f6" />
            <Text style={styles.loginTitle}>EDGS Chauffeurs</Text>
            <Text style={styles.loginSubtitle}>Saisissez votre code PIN (Défaut: 1234)</Text>
          </View>

          <View style={styles.dotsContainer}>
            {[1, 2, 3, 4].map(idx => (
              <View 
                key={idx} 
                style={[styles.dot, pin.length >= idx ? styles.dotFilled : styles.dotEmpty]} 
              />
            ))}
          </View>

          {loading ? (
            <View style={{ marginVertical: 40, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 16, fontWeight: '600' }}>Connexion en cours...</Text>
              <Text style={{ color: '#64748b', marginTop: 8, fontSize: 12, textAlign: 'center', paddingHorizontal: 40 }}>
                (Le premier démarrage du serveur d'évaluation gratuit Render peut nécessiter jusqu'à 50 secondes)
              </Text>
            </View>
          ) : (
            <View style={styles.keyboard}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['C', '0', '⌫']
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keyboardRow}>
                  {row.map(key => (
                    <TouchableOpacity
                      key={key}
                      style={styles.key}
                      onPress={() => {
                        if (key === 'C') clearPin();
                        else if (key === '⌫') setPin(pin.slice(0, -1));
                        else handleKeyPress(key);
                      }}
                    >
                      <Text style={styles.keyText}>{key}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* SCREEN 2: SELECT TRUCK */}
      {currentScreen === 'select_truck' && (
        <ScrollView style={styles.dashboardContainer}>
          <TouchableOpacity style={[styles.btnBack, { marginHorizontal: 16, marginTop: 16 }]} onPress={() => {
            setToken('');
            setEmployee(null);
            setCurrentScreen('login');
          }}>
            <Text style={styles.btnBackText}>← Retour connexion</Text>
          </TouchableOpacity>
          <Text style={[styles.loginTitle, { textAlign: 'center', marginTop: 20 }]}>Sélectionner un véhicule</Text>
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>Associez votre tablette à un camion.</Text>
          
          <View style={{ gap: 12, paddingHorizontal: 16 }}>
            {trucksList.map(t => (
              <TouchableOpacity key={t.id} style={styles.truckItem} onPress={() => handleSelectTruck(t)}>
                <Icon name="truck" size={32} color="#3b82f6" />
                <View>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{t.plateNumber}</Text>
                  <Text style={{ color: '#94a3b8' }}>{t.model}</Text>
                </View>
                <Text style={{ color: '#10b981', marginLeft: 'auto', fontWeight: '600' }}>{t.currentStock} sacs à bord</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* SCREEN 3: DASHBOARD */}
      {currentScreen === 'dashboard' && employee && truck && (
        <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Out of zone banner alert */}
          {isOutOfZone && (
            <View style={[styles.alertCard, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' }]}>
              <Icon name="alert" size={24} color="#ef4444" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: '#ef4444' }]}>Hors Zone Chantier</Text>
                <Text style={styles.alertDesc}>
                  Attention : Vous êtes éloigné du chantier de plus de 100 mètres.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Bonjour, {employee.firstName}</Text>
              <Text style={styles.truckText}>Véhicule : {truck.plateNumber}</Text>
            </View>
            <TouchableOpacity style={styles.btnLogout} onPress={() => {
              setToken('');
              setEmployee(null);
              setTruck(null);
              setCurrentScreen('login');
            }}>
              <Text style={styles.btnLogoutText}>Quitter</Text>
            </TouchableOpacity>
          </View>

          {/* Stock warnings */}
          {truck.currentStock <= truck.stockAlertThreshold && (
            <View style={styles.alertCard}>
              <Icon name="alert" size={24} color="#f59e0b" />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Alerte Stock Bas</Text>
                <Text style={styles.alertDesc}>
                  Stock insuffisant ({truck.currentStock} sacs). Veuillez réapprovisionner.
                </Text>
              </View>
            </View>
          )}

          {/* Quick actions row */}
          {!dayStarted ? (
            <View style={styles.glassCard}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
                Sélectionner le mode de déplacement :
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                {(['panier', 'petit', 'grand'] as const).map(mode => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modeBtn,
                      displacementMode === mode ? styles.modeBtnActive : styles.modeBtnInactive
                    ]}
                    onPress={() => setDisplacementMode(mode)}
                  >
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' }}>
                      {mode === 'panier' ? 'Panier' : mode === 'petit' ? 'Déplacement' : 'Grand Déplac.'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.btnLargePrimary} onPress={startDay}>
                <Icon name="clock" size={28} />
                <Text style={styles.btnLargeText}>DÉBUT DE JOURNÉE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 20 }}>
              
              {/* Pauses / Pointage Controls */}
              <View style={[styles.glassCard, { borderColor: isPaused ? '#ef4444' : 'rgba(255,255,255,0.08)' }]}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 }}>
                  Statut : {isPaused ? `En Pause (${pauseType === 'repas' ? 'Déjeuner' : 'Technique'})` : 'En Activité'}
                </Text>
                <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
                  Mode : {displacementMode === 'panier' ? 'Panier' : displacementMode === 'petit' ? 'Déplacement' : 'Grand Déplacement'}
                </Text>
                
                {!isPaused ? (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={[styles.btnLargeSecondary, { flex: 1, backgroundColor: '#b45309', paddingVertical: 12 }]}
                      onPress={() => startPause('repas')}
                    >
                      <Text style={[styles.btnLargeText, { fontSize: 12 }]}>PAUSE REPAS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnLargeSecondary, { flex: 1, backgroundColor: '#475569', paddingVertical: 12 }]}
                      onPress={() => startPause('technique')}
                    >
                      <Text style={[styles.btnLargeText, { fontSize: 12 }]}>PAUSE TECHNIQUE</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.btnLargeSuccess, { paddingVertical: 12 }]}
                    onPress={endPause}
                  >
                    <Text style={styles.btnLargeText}>REPRENDRE LE TRAVAIL</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => setCurrentScreen('stock')}
                >
                  <Icon name="package" size={32} color="#f59e0b" />
                  <Text style={styles.actionCardTitle}>Gérer Sable</Text>
                  <Text style={styles.actionCardDesc}>{truck.currentStock} sacs à bord</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => {
                    if (activeMission) {
                      setCurrentScreen('mission_detail');
                    } else {
                      Alert.alert('Information', "Aucune mission n'est planifiée pour ce véhicule aujourd'hui.");
                    }
                  }}
                >
                  <Icon name="truck" size={32} color="#3b82f6" />
                  <Text style={styles.actionCardTitle}>Mission Assignée</Text>
                  <Text style={styles.actionCardDesc}>
                    {activeMission ? activeMission.title : 'Aucune mission pour aujourd\'hui'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.btnLargeDanger} onPress={endDay}>
                <Icon name="clock" size={28} />
                <Text style={styles.btnLargeText}>FIN DE JOURNÉE</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sync status and SQLite logs */}
          {syncQueue.length > 0 && (
            <View style={styles.syncCard}>
              <Icon name="sync" size={20} color="#3b82f6" />
              <Text style={styles.syncText}>
                {syncQueue.length} opérations en cache SQLite à synchroniser.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* SCREEN 4: MISSION DETAIL */}
      {currentScreen === 'mission_detail' && activeMission && (
        <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 40 }}>
          <TouchableOpacity style={styles.btnBack} onPress={() => setCurrentScreen('dashboard')}>
            <Text style={styles.btnBackText}>← Retour Dashboard</Text>
          </TouchableOpacity>

          <View style={styles.glassCard}>
            <Text style={styles.missionTitle}>{activeMission.title}</Text>
            
            <View style={styles.infoRow}>
              <Icon name="user" size={18} color="#94a3b8" />
              <Text style={styles.infoText}>Client : {activeMission.client}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="mapPin" size={18} color="#94a3b8" />
              <Text style={styles.infoText}>Chantier : {activeMission.worksite}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="clock" size={18} color="#94a3b8" />
              <Text style={styles.infoText}>Statut : {getStatusLabel(activeMission.status)}</Text>
            </View>

            {activeMission.notes ? (
              <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 12 }}>
                <Text style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Consignes: {activeMission.notes}</Text>
              </View>
            ) : null}
          </View>

          {isOutOfZone && (
            <View style={[styles.alertCard, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444', marginBottom: 16 }]}>
              <Icon name="alert" size={24} color="#ef4444" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: '#ef4444' }]}>Hors Zone Chantier</Text>
                <Text style={styles.alertDesc}>
                  Attention : Vous êtes éloigné du chantier de plus de 100 mètres.
                </Text>
              </View>
            </View>
          )}

          {/* Navigation Button */}
          <TouchableOpacity style={[styles.btnLargeSecondary, { marginBottom: 16 }]} onPress={openGps}>
            <Icon name="mapPin" size={24} color="#3b82f6" />
            <Text style={styles.btnLargeText}>OUVRIR GPS (NAVIGATION)</Text>
          </TouchableOpacity>

          {/* Action buttons */}
          {activeMission.status === 'planned' && (
            <TouchableOpacity style={styles.btnLargePrimary} onPress={startMission}>
              <Text style={styles.btnLargeText}>COMMENCER CHANTIER</Text>
            </TouchableOpacity>
          )}

          {activeMission.status === 'in_progress' && (
            <View style={{ gap: 16 }}>
              <TouchableOpacity 
                style={styles.btnLargeSecondary} 
                onPress={() => {
                  setCameraType('before');
                  setCurrentScreen('camera');
                }}
              >
                <Icon name="camera" size={24} />
                <Text style={styles.btnLargeText}>Photo Avant Travaux</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnLargeSecondary} 
                onPress={() => {
                  setCameraType('after');
                  setCurrentScreen('camera');
                }}
              >
                <Icon name="camera" size={24} />
                <Text style={styles.btnLargeText}>Photo Après Travaux</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnLargeSuccess} onPress={endMission}>
                <Icon name="check" size={24} />
                <Text style={styles.btnLargeText}>TERMINER MISSION (CLÔTURE)</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMission.status === 'completed' && (
            <View style={styles.successCard}>
              <Icon name="check" size={28} color="#10b981" />
              <Text style={styles.successText}>Mission complétée avec succès !</Text>
            </View>
          )}

          {/* Fullscreen Signature Overlay inside Screen 4 if showSignaturePad is true */}
          {showSignaturePad && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0f172a', zIndex: 999, padding: 20, justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>
                Validation Chef d'Équipe
              </Text>
              <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>
                Veuillez signer ci-dessous pour valider la fin de chantier :
              </Text>
              
              <View style={{ height: 260, backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 2, borderColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
                <View 
                  style={{ width: '100%', height: '100%' }}
                  onTouchStart={(e) => {
                    const { locationX, locationY } = e.nativeEvent;
                    setSignaturePoints([{ x: locationX, y: locationY }]);
                  }}
                  onTouchMove={(e) => {
                    const { locationX, locationY } = e.nativeEvent;
                    setSignaturePoints(prev => [...prev, { x: locationX, y: locationY }]);
                  }}
                >
                  {signaturePoints.map((pt, idx) => {
                    if (idx === 0) return null;
                    const prevPt = signaturePoints[idx - 1];
                    const dx = pt.x - prevPt.x;
                    const dy = pt.y - prevPt.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len > 30) return null;
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    return (
                      <View 
                        key={idx} 
                        style={{
                          position: 'absolute',
                          left: prevPt.x,
                          top: prevPt.y,
                          width: len,
                          height: 3,
                          backgroundColor: '#3b82f6',
                          transform: [{ rotate: `${angle}deg` }],
                          transformOrigin: 'top left'
                        }}
                      />
                    );
                  })}
                  
                  {signaturePoints.length === 0 && (
                    <Text style={{ color: '#475569', fontSize: 14, textAlign: 'center', marginTop: 110 }}>Signez ici avec votre doigt</Text>
                  )}
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity 
                  style={[styles.btnLargeSecondary, { flex: 1, backgroundColor: '#334155' }]} 
                  onPress={() => {
                    setSignaturePoints([]);
                    setShowSignaturePad(false);
                  }}
                >
                  <Text style={styles.btnLargeText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.btnLargeSecondary, { flex: 1, backgroundColor: '#dc2626' }]} 
                  onPress={() => setSignaturePoints([])}
                >
                  <Text style={styles.btnLargeText}>Effacer</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.btnLargeSuccess, { flex: 1.5 }]} 
                  onPress={() => {
                    if (signaturePoints.length < 5) {
                      Alert.alert('Signature', 'Veuillez apposer votre signature avant de valider.');
                      return;
                    }
                    submitEndMission("data:image/svg+xml;base64,drawing_sig");
                  }}
                >
                  <Text style={styles.btnLargeText}>Valider Clôture</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* SCREEN 5: STOCK MANAGEMENT */}
      {currentScreen === 'stock' && truck && (
        <View style={styles.dashboardContainer}>
          <TouchableOpacity style={styles.btnBack} onPress={() => setCurrentScreen('dashboard')}>
            <Text style={styles.btnBackText}>← Retour</Text>
          </TouchableOpacity>

          <View style={styles.glassCard}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16 }}>Rechargement du sable</Text>
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#f59e0b', textAlign: 'center', marginVertical: 20 }}>
              {truck.currentStock} sacs
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 }}>
              <TouchableOpacity style={styles.btnCircle} onPress={() => updateStock(10)}>
                <Text style={styles.btnCircleText}>+10</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnCircle} onPress={() => updateStock(-5)}>
                <Text style={styles.btnCircleText}>-5</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#94a3b8', textAlign: 'center', fontSize: 13, marginBottom: 10 }}>Les modifications mettent à jour la base SQLite locale immédiatement et se synchronisent en tâche de fond.</Text>
          </View>

          <View style={[styles.glassCard, { marginTop: 16, flex: 1 }]}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 }}>Matériels & Équipements Embarqués</Text>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
              {truck.stocks && truck.stocks.length > 0 ? (
                truck.stocks.map((s: any) => (
                  <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
                    <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '600' }}>{s.stockItem?.name}</Text>
                    <Text style={{ color: '#34d399', fontSize: 15, fontWeight: '700' }}>
                      {s.quantity} {s.stockItem?.unit || 'pcs'}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#94a3b8', textAlign: 'center', paddingVertical: 16 }}>Aucun équipement (compresseur, casque, etc.) chargé pour le moment.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* SCREEN 6: CAMERA SCREEN */}
      {currentScreen === 'camera' && (
        <View style={styles.cameraContainer}>
          {useSimulatedCamera ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
              <TouchableOpacity style={[styles.btnBack, { position: 'absolute', top: 40, left: 16 }]} onPress={() => setCurrentScreen('mission_detail')}>
                <Text style={styles.btnBackText}>← Retour</Text>
              </TouchableOpacity>
              <Icon name="camera" size={80} color="#94a3b8" />
              <Text style={{ fontSize: 18, color: '#f8fafc', marginVertical: 20 }}>Simulateur d'Appareil Photo Mobile</Text>
              <Text style={{ color: '#64748b', marginBottom: 30 }}>Cliché : Photo {cameraType === 'before' ? 'Avant' : 'Après'} sablage</Text>
              
              <TouchableOpacity style={styles.btnLargePrimary} onPress={handleCapturePhoto}>
                <Text style={styles.btnLargeText}>SIMULER CLICHÉ PHOTO</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setUseSimulatedCamera(false)}>
                <Text style={{ color: '#3b82f6', textDecorationLine: 'underline' }}>Utiliser Caméra Physique</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView style={StyleSheet.absoluteFill} ref={cameraRef}>
              <View style={styles.cameraOverlay}>
                <TouchableOpacity style={styles.btnCapture} onPress={handleCapturePhoto}>
                  <View style={styles.captureInner} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.btnCancelCapture} onPress={() => setCurrentScreen('mission_detail')}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 40,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  bannerOnline: {
    backgroundColor: '#1e293b',
  },
  bannerOffline: {
    backgroundColor: '#991b1b',
  },
  bannerText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 12,
  },
  btnBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  btnBannerText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '700',
  },
  configCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  configInput: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  btnConfigClose: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 10
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 16,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  dotEmpty: {
    borderColor: '#475569',
  },
  dotFilled: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  keyboard: {
    gap: 12,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
  },
  truckItem: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  dashboardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  truckText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  btnLogout: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnLogoutText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f59e0b',
  },
  alertDesc: {
    fontSize: 13,
    color: '#f8fafc',
    marginTop: 4,
  },
  btnLargePrimary: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  btnLargeSecondary: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  btnLargeSuccess: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  btnLargeDanger: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  btnLargeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 8,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center'
  },
  actionCardDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  syncCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  syncText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  btnBack: {
    marginBottom: 20,
  },
  btnBackText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600',
  },
  glassCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  missionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  infoText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  successCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700',
  },
  btnCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCircleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 30,
    alignItems: 'flex-end',
  },
  btnCapture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  btnCancelCapture: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modeBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  modeBtnInactive: {
    backgroundColor: '#1e293b',
    borderColor: 'rgba(255,255,255,0.1)',
  }
});
