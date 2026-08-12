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
import * as LocalAuthentication from 'expo-local-authentication';

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
    settings: '⚙️',
    fingerprint: '👆',
    calendar: '📅',
    plus: '➕',
    history: '📜',
    close: '❌'
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
  const [currentScreen, setCurrentScreen] = useState<'login' | 'change_password' | 'select_truck' | 'dashboard' | 'mission_detail' | 'stock' | 'camera' | 'leaves'>('login');
  
  // Configuration
  const [rawServerUrl, setRawServerUrl] = useState('https://edgs-app.onrender.com'); // Production Render backend URL
  const serverUrl = rawServerUrl.trim().replace(/\/+$/, '');
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Connection states
  const [isOffline, setIsOffline] = useState(false);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  // Auth & Session state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [employee, setEmployee] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Leave Request state
  const [leaveRequestsList, setLeaveRequestsList] = useState<any[]>([]);
  const [leaveType, setLeaveType] = useState<'conge' | 'rtt' | 'sans_solde' | 'autre'>('conge');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveIsHalfDay, setLeaveIsHalfDay] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveError, setLeaveError] = useState('');
  
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

  // Biometric authentication trigger
  const handleBiometricAuth = async (currentToken: string) => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Déverrouiller EDGS Manager',
        fallbackLabel: 'Utiliser le mot de passe',
      });

      if (result.success) {
        const cachedT = db.getAllSync('SELECT * FROM cached_truck LIMIT 1');
        if (cachedT.length > 0) {
          const tObj: any = cachedT[0];
          try {
            if (tObj.stocksJson) tObj.stocks = JSON.parse(tObj.stocksJson);
          } catch(e){}
          setTruck(tObj);
          setCurrentScreen('dashboard');
        } else {
          // Fetch trucks list
          const resTrucks = await fetch(`${serverUrl}/trucks`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
          });
          if (resTrucks.ok) {
            const dataTrucks = await resTrucks.json();
            setTrucksList(dataTrucks);
          }
          setCurrentScreen('select_truck');
        }
      }
    } catch (e) {
      console.error('Biometric authentication error:', e);
    }
  };

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
        CREATE TABLE IF NOT EXISTS session_store (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

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

      // Load session
      const savedToken = db.getFirstSync('SELECT value FROM session_store WHERE key = ?', ['token']) as any;
      const savedEmployee = db.getFirstSync('SELECT value FROM session_store WHERE key = ?', ['employee']) as any;
      const savedBiometrics = db.getFirstSync('SELECT value FROM session_store WHERE key = ?', ['biometrics_enabled']) as any;

      if (savedToken && savedEmployee) {
        const tokenVal = savedToken.value;
        const empVal = JSON.parse(savedEmployee.value);
        setToken(tokenVal);
        setEmployee(empVal);

        if (savedBiometrics && savedBiometrics.value === 'true') {
          setBiometricsEnabled(true);
          // Trigger bio auth after UI mounts
          setTimeout(() => {
            handleBiometricAuth(tokenVal);
          }, 500);
        }
      }

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

  // Load leave requests when screen opens
  useEffect(() => {
    if (currentScreen === 'leaves') {
      fetchLeaveRequests();
    }
  }, [currentScreen]);

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

  // Credentials Login flow
  const handleLoginSubmit = async () => {
    if (loading) return;
    if (!username || !password) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom d\'utilisateur et votre mot de passe.');
      return;
    }

    if (!isOffline) {
      setLoading(true);
      try {
        const res = await fetch(`${serverUrl}/auth/employee/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
          throw new Error('Identifiants incorrects');
        }

        const data = await res.json();
        const currentToken = data.access_token;
        setToken(currentToken);
        setEmployee(data.employee);

        // Save session in SQLite
        db.runSync('INSERT OR REPLACE INTO session_store (key, value) VALUES (?, ?)', ['token', currentToken]);
        db.runSync('INSERT OR REPLACE INTO session_store (key, value) VALUES (?, ?)', ['employee', JSON.stringify(data.employee)]);

        // Check if password must be changed (first login)
        if (data.employee.mustChangePassword) {
          setCurrentScreen('change_password');
          setLoading(false);
          return;
        }

        // Prompt to enable biometrics if supported and not prompted yet
        const savedBiometrics = db.getFirstSync('SELECT value FROM session_store WHERE key = ?', ['biometrics_enabled']) as any;
        if (!savedBiometrics) {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          if (hasHardware && isEnrolled) {
            Alert.alert(
              'Biométrie',
              'Voulez-vous activer la connexion par biométrie (Empreinte/FaceID) pour les prochaines connexions ?',
              [
                {
                  text: 'Non',
                  onPress: () => {
                    db.runSync('INSERT OR REPLACE INTO session_store (key, value) VALUES (?, ?)', ['biometrics_enabled', 'false']);
                    setBiometricsEnabled(false);
                  }
                },
                {
                  text: 'Oui',
                  onPress: () => {
                    db.runSync('INSERT OR REPLACE INTO session_store (key, value) VALUES (?, ?)', ['biometrics_enabled', 'true']);
                    setBiometricsEnabled(true);
                  }
                }
              ]
            );
          }
        }

        // Fetch trucks list
        const resTrucks = await fetch(`${serverUrl}/trucks`, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (resTrucks.ok) {
          const dataTrucks = await resTrucks.json();
          setTrucksList(dataTrucks);
        }
        setCurrentScreen('select_truck');

      } catch (err: any) {
        if (err.message === 'Identifiants incorrects') {
          Alert.alert('Connexion échouée', 'Nom d\'utilisateur ou mot de passe incorrect.');
        } else {
          Alert.alert(
            'Serveur indisponible',
            'Le serveur est injoignable. S\'il s\'agit de la première connexion de la journée, le serveur gratuit Render nécessite environ 50 secondes pour démarrer. Veuillez patienter et réessayer.'
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Offline local login bypass
      if (username === 'cjean' && password === '123456') {
        const mockEmployee = { id: 'offline-emp-id', firstName: 'Jean', lastName: 'Chauffeur', paidLeaveBalance: 25, rttBalance: 12 };
        setEmployee(mockEmployee);
        loadCachedData();
        setCurrentScreen('dashboard');
      } else {
        Alert.alert('Erreur', 'Identifiants incorrects en mode hors-ligne (cjean / 123456).');
      }
    }
  };

  // Change Password flow
  const handleChangePasswordSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${serverUrl}/auth/employee/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        throw new Error('Erreur de serveur');
      }

      // Update state and SQLite
      const updatedEmp = { ...employee, mustChangePassword: false };
      setEmployee(updatedEmp);
      db.runSync('INSERT OR REPLACE INTO session_store (key, value) VALUES (?, ?)', ['employee', JSON.stringify(updatedEmp)]);

      Alert.alert('Succès', 'Votre mot de passe a été modifié avec succès.');

      // Clear change password fields
      setNewPassword('');
      setConfirmPassword('');

      // Fetch trucks list and go to select_truck
      const resTrucks = await fetch(`${serverUrl}/trucks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resTrucks.ok) {
        const dataTrucks = await resTrucks.json();
        setTrucksList(dataTrucks);
      }
      setCurrentScreen('select_truck');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de modifier le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Leave Requests History
  const fetchLeaveRequests = async () => {
    if (isOffline || !employee || !token) return;
    try {
      const res = await fetch(`${serverUrl}/leave-requests/employee/${employee.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaveRequestsList(data);
      }

      const resEmp = await fetch(`${serverUrl}/employees/${employee.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resEmp.ok) {
        const dataEmp = await resEmp.json();
        setEmployee(dataEmp);
        db.runSync('INSERT OR REPLACE INTO session_store (key, value) VALUES (?, ?)', ['employee', JSON.stringify(dataEmp)]);
      }
    } catch (e) {
      console.error('Failed to fetch leave requests:', e);
    }
  };

  // Submit Leave Request
  const handleLeaveSubmit = async () => {
    if (!leaveStartDate || !leaveEndDate) {
      setLeaveError('Veuillez renseigner les dates de début et de fin.');
      return;
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(leaveStartDate) || !dateRegex.test(leaveEndDate)) {
      setLeaveError('Les dates doivent être au format AAAA-MM-JJ (ex: 2026-08-15).');
      return;
    }

    setLeaveError('');
    setLoading(true);
    try {
      const res = await fetch(`${serverUrl}/leave-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: employee.id,
          type: leaveType,
          startDate: `${leaveStartDate}T08:00:00Z`,
          endDate: `${leaveEndDate}T18:00:00Z`,
          isHalfDay: leaveIsHalfDay,
          reason: leaveReason
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de la soumission de la demande');
      }

      Alert.alert('Succès', 'Votre demande de congé a été enregistrée.');
      
      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');
      setLeaveIsHalfDay(false);
      
      fetchLeaveRequests();
    } catch (err: any) {
      setLeaveError(err.message || 'Impossible de soumettre la demande de congé.');
    } finally {
      setLoading(false);
    }
  };

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

    // Update SQLite and React State immediately for instantaneous UI updates
    db.runSync("UPDATE cached_missions SET status = 'in_progress' WHERE id = ?", [activeMission.id]);
    setMissionsList(prev => prev.map(m => m.id === activeMission.id ? { ...m, status: 'in_progress' } : m));
    setActiveMission(prev => prev ? { ...prev, status: 'in_progress' } : null);

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

    // Update SQLite and React State immediately for instantaneous UI updates
    db.runSync("UPDATE cached_missions SET status = 'completed' WHERE id = ?", [activeMission.id]);
    
    // We update the state immediately
    const updatedList = missionsList.map(m => m.id === activeMission.id ? { ...m, status: 'completed' as const } : m);
    setMissionsList(updatedList);
    
    // Find next active mission
    const nextInProgress = updatedList.find(m => m.status === 'in_progress');
    const nextPlanned = updatedList.find(m => m.status === 'planned');
    setActiveMission(nextInProgress || nextPlanned || null);

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
      db.runSync(
        "INSERT INTO pending_sync (type, payload, createdAt) VALUES ('end_mission', ?, ?)",
        [JSON.stringify(payload), new Date().toISOString()]
      );
    }

    Alert.alert('Chantier', 'Mission clôturée avec signature enregistrée.');
    setShowSignaturePad(false);
    
    // Smooth transition back to dashboard
    setCurrentScreen('dashboard');
    
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
    if (dayStarted && truck) {
      interval = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          
          let outOfZone = false;
          if (activeMission && activeMission.status === 'in_progress' && activeMission.latitude && activeMission.longitude) {
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
            missionId: (activeMission && activeMission.status === 'in_progress') ? activeMission.id : null,
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
    return () => {
      if (interval) clearInterval(interval);
    };
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
            <Text style={styles.loginSubtitle}>
              {isOffline ? 'Connexion en mode hors-ligne' : 'Identifiez-vous pour accéder à votre espace'}
            </Text>
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
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Nom d'utilisateur</Text>
                <TextInput
                  style={styles.loginInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Ex: cjean"
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Mot de passe</Text>
                <TextInput
                  style={styles.loginInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity style={styles.btnLoginSubmit} onPress={handleLoginSubmit}>
                <Text style={styles.btnLoginSubmitText}>Se connecter</Text>
              </TouchableOpacity>

              {biometricsEnabled && (
                <TouchableOpacity 
                  style={styles.btnBiometricContainer}
                  onPress={() => {
                    const savedToken = db.getFirstSync('SELECT value FROM session_store WHERE key = ?', ['token']) as any;
                    if (savedToken) {
                      handleBiometricAuth(savedToken.value);
                    } else {
                      Alert.alert('Information', 'Veuillez vous connecter avec votre mot de passe une première fois pour configurer la biométrie.');
                    }
                  }}
                >
                  <Icon name="fingerprint" size={32} color="#3b82f6" />
                  <Text style={styles.btnBiometricText}>Déverrouiller avec la biométrie</Text>
                </TouchableOpacity>
              )}
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
            db.runSync('DELETE FROM session_store WHERE key = ?', ['token']);
            db.runSync('DELETE FROM session_store WHERE key = ?', ['employee']);
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
              db.runSync('DELETE FROM session_store WHERE key = ?', ['token']);
              db.runSync('DELETE FROM session_store WHERE key = ?', ['employee']);
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
                  <Text style={styles.actionCardTitle}>Mission</Text>
                  <Text style={styles.actionCardDesc}>
                    {activeMission ? activeMission.title : 'Aucune mission'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => setCurrentScreen('leaves')}
                >
                  <Icon name="calendar" size={32} color="#10b981" />
                  <Text style={styles.actionCardTitle}>Congés & RTT</Text>
                  <Text style={styles.actionCardDesc}>Demandes</Text>
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

      {/* SCREEN 7: CHANGE PASSWORD */}
      {currentScreen === 'change_password' && (
        <View style={styles.loginContainer}>
          <View style={styles.loginHeader}>
            <Icon name="lock" size={48} color="#3b82f6" />
            <Text style={styles.loginTitle}>Nouveau mot de passe</Text>
            <Text style={styles.loginSubtitle}>Veuillez modifier votre mot de passe par défaut pour sécuriser votre compte.</Text>
          </View>
          
          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.loginInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Au moins 6 caractères"
                placeholderTextColor="#475569"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.loginInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmer"
                placeholderTextColor="#475569"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.btnLoginSubmit} onPress={handleChangePasswordSubmit}>
              <Text style={styles.btnLoginSubmitText}>Enregistrer le mot de passe</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SCREEN 8: LEAVES WORKFLOW */}
      {currentScreen === 'leaves' && employee && (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
          {/* Header */}
          <View style={styles.banner}>
            <TouchableOpacity 
              style={styles.btnBack} 
              onPress={() => setCurrentScreen('dashboard')}
            >
              <Text style={styles.btnBackText}>← Retour</Text>
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Demande de Congé</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {/* Balances Card */}
            <View style={styles.glassCard}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Vos Soldes Disponibles</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 12, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>Congés Payés</Text>
                  <Text style={{ color: '#3b82f6', fontSize: 24, fontWeight: '800', marginTop: 4 }}>{employee.paidLeaveBalance ?? 0} j</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 8, marginLeft: 8, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>RTT</Text>
                  <Text style={{ color: '#10b981', fontSize: 24, fontWeight: '800', marginTop: 4 }}>{employee.rttBalance ?? 0} j</Text>
                </View>
              </View>
            </View>

            {/* Request Form */}
            <View style={styles.glassCard}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>Nouvelle Demande</Text>
              
              {leaveError ? (
                <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: '#ef4444', padding: 10, borderRadius: 8, marginBottom: 16 }}>
                  <Text style={{ color: '#ef4444', fontSize: 13 }}>{leaveError}</Text>
                </View>
              ) : null}

              {/* Leave Type Selector */}
              <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Type de congé</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {[
                  { key: 'conge', label: 'Congé Payé' },
                  { key: 'rtt', label: 'RTT' },
                  { key: 'sans_solde', label: 'Sans Solde' },
                  { key: 'autre', label: 'Autre' }
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.modeBtn,
                      leaveType === item.key ? styles.modeBtnActive : styles.modeBtnInactive,
                      { paddingHorizontal: 12, paddingVertical: 8 }
                    ]}
                    onPress={() => setLeaveType(item.key as any)}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Inputs */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Date de début</Text>
                  <TextInput
                    style={styles.loginInput}
                    value={leaveStartDate}
                    onChangeText={setLeaveStartDate}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor="#475569"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Date de fin</Text>
                  <TextInput
                    style={styles.loginInput}
                    value={leaveEndDate}
                    onChangeText={setLeaveEndDate}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor="#475569"
                  />
                </View>
              </View>

              {/* Half Day Checkbox */}
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 }}
                onPress={() => setLeaveIsHalfDay(!leaveIsHalfDay)}
              >
                <View style={{ width: 20, height: 20, borderWidth: 2, borderColor: '#475569', borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: leaveIsHalfDay ? '#3b82f6' : 'transparent' }}>
                  {leaveIsHalfDay && <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>✓</Text>}
                </View>
                <Text style={{ color: '#fff', fontSize: 14 }}>Demi-journée (0.5 jour)</Text>
              </TouchableOpacity>

              {/* Reason input */}
              <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Motif / Raison (Optionnel)</Text>
              <TextInput
                style={[styles.loginInput, { height: 60, textAlignVertical: 'top', paddingVertical: 8 }]}
                value={leaveReason}
                onChangeText={setLeaveReason}
                placeholder="Ex: Raisons familiales, RDV médical..."
                placeholderTextColor="#475569"
                multiline
              />

              <TouchableOpacity 
                style={[styles.btnLargePrimary, { marginTop: 20 }]} 
                onPress={handleLeaveSubmit}
              >
                <Text style={styles.btnLargeText}>SOUMETTRE LA DEMANDE</Text>
              </TouchableOpacity>
            </View>

            {/* Requests History */}
            <View style={[styles.glassCard, { marginBottom: 30 }]}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>Historique des demandes</Text>
              {leaveRequestsList.length === 0 ? (
                <Text style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginVertical: 20 }}>Aucune demande enregistrée.</Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {leaveRequestsList.map((req: any) => {
                    const formattedStart = req.startDate ? req.startDate.split('T')[0] : '';
                    const formattedEnd = req.endDate ? req.endDate.split('T')[0] : '';
                    const dateDisplay = formattedStart === formattedEnd ? formattedStart : `${formattedStart} au ${formattedEnd}`;
                    
                    let statusColor = '#f59e0b';
                    let statusText = 'En attente';
                    if (req.status === 'approved') {
                      statusColor = '#10b981';
                      statusText = 'Accepté';
                    } else if (req.status === 'rejected') {
                      statusColor = '#ef4444';
                      statusText = 'Refusé';
                    }

                    let typeText = req.type;
                    if (req.type === 'conge') typeText = 'Congé Payé';
                    else if (req.type === 'rtt') typeText = 'RTT';
                    else if (req.type === 'sans_solde') typeText = 'Sans Solde';
                    else if (req.type === 'autre') typeText = 'Autre';

                    return (
                      <View key={req.id} style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{typeText}</Text>
                          <Text style={{ color: statusColor, fontWeight: '700', fontSize: 12 }}>{statusText}</Text>
                        </View>
                        <Text style={{ color: '#94a3b8', fontSize: 13 }}>Dates: {dateDisplay} {req.isHalfDay ? '(½ journée)' : ''}</Text>
                        {req.reason ? <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>Motif: {req.reason}</Text> : null}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
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
  loginInput: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    color: '#f8fafc',
    fontSize: 15,
    height: 48,
    paddingHorizontal: 16,
  },
  btnLoginSubmit: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnLoginSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnBiometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 12,
    marginTop: 8,
  },
  btnBiometricText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '700',
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
