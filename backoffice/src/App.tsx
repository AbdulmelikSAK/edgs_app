const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  Truck as TruckIcon, 
  Package, 
  TrendingUp, 
  FileText, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Plus,
  Download,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ImageIcon,
  UserCheck,
  Wrench,
  Users,
  FileSpreadsheet,
  Receipt,
  History as HistoryIcon,
  ShieldAlert,
  HelpCircle,
  Coins,
  Search,
  Check,
  Send,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';

// Interfaces matching TypeORM entities
interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Worksite {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface Truck {
  id: string;
  plateNumber: string;
  model: string;
  year: number;
  currentStock: number;
  stockAlertThreshold: number;
  pinCode?: string;
  controlTechniqueDate?: string;
  insuranceExpirationDate?: string;
  lastServiceDate?: string;
  mileage?: number;
  stocks?: any[];
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
  hourlyRate?: number;
  phone?: string;
  email?: string;
  qualification?: string;
  pin?: string;
  isActive?: boolean;
}

interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  status: 'Disponible' | 'En maintenance' | 'En panne';
  purchaseDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  truck?: Truck;
}

interface Mission {
  id: string;
  title: string;
  type?: string;
  clientName?: string;
  worksiteAddress?: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  surfaceArea?: number;
  fuelConsumption?: number;
  sandBagsUsed?: number;
  truck?: Truck;
  client?: Client;
  worksite?: Worksite;
  notes?: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  client: Client;
  mission?: Mission;
  status: 'Brouillon' | 'Envoyé' | 'Accepté' | 'Refusé' | 'Facturé';
  date: string;
  lines: any[];
  totalHT: number;
  vatRate: number;
  notes?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: Client;
  quote?: Quote;
  status: 'Brouillon' | 'Envoyé' | 'Payé' | 'Retard';
  date: string;
  dueDate: string;
  lines: any[];
  totalHT: number;
  vatRate: number;
  notes?: string;
}

interface PlanningEntry {
  id: string;
  year: number;
  week: number;
  dayOfWeek: number;
  mission: Mission;
  truck?: Truck;
  notes?: string;
}

const getISOWeekAndYear = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: date.getUTCFullYear(), week: weekNo };
};

function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'missions' | 'planning' | 'gps' | 'photos' | 'reports' | 'trucks' | 'assignments' | 'stock' | 'equipment' | 'employees' | 'quotes' | 'invoices' | 'audit'
  >('dashboard');
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  // Devis Public Form State
  const [devisForm, setDevisForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    prestation: 'Sablage',
    surface: '',
    description: '',
  });
  const [devisSubmitted, setDevisSubmitted] = useState(false);

  // Data states
  const [missions, setMissions] = useState<Mission[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [worksites, setWorksites] = useState<Worksite[]>([]);
  const [weeklyPlanning, setWeeklyPlanning] = useState<PlanningEntry[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [livePositions, setLivePositions] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);

  // New modules states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [photosList, setPhotosList] = useState<any[]>([]);

  // Dynamic stocks state
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [newStockItem, setNewStockItem] = useState({ name: '', unit: 'pcs' });
  const [selectedTruckForStock, setSelectedTruckForStock] = useState<string>('');
  const [stockItemToAssign, setStockItemToAssign] = useState<string>('');
  const [assignQuantity, setAssignQuantity] = useState<string>('1');

  // PV Driver Lookup state
  const [pvLookup, setPvLookup] = useState({
    truckId: '',
    date: '',
    time: '12:00',
  });
  const [pvResult, setPvResult] = useState<any>(null);

  // CRUD Forms States
  const [newMission, setNewMission] = useState({
    title: '',
    type: 'Sablage',
    clientName: '',
    worksiteAddress: '',
    description: '',
    scheduledDate: '',
    estimatedPrice: '',
    truckId: '',
    surfaceArea: '',
  });

  const [newTruck, setNewTruck] = useState({
    plateNumber: '',
    model: '',
    year: '',
    pinCode: '',
    stockAlertThreshold: '10',
    controlTechniqueDate: '',
    insuranceExpirationDate: '',
    lastServiceDate: '',
    mileage: '0',
  });
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    badgeNumber: '',
    pin: '',
    hourlyRate: '45',
    phone: '',
    email: '',
    qualification: 'Ouvrier Qualifié',
  });
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    serialNumber: '',
    status: 'Disponible' as any,
    purchaseDate: '',
    nextMaintenanceDate: '',
    notes: '',
    assignedTruckId: '',
  });
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  const [newQuoteForm, setNewQuoteForm] = useState({
    clientId: '',
    missionId: '',
    quoteNumber: '',
    linesText: '',
    totalHT: '',
    vatRate: '20',
    notes: '',
  });

  const [newInvoiceForm, setNewInvoiceForm] = useState({
    clientId: '',
    quoteId: '',
    invoiceNumber: '',
    linesText: '',
    totalHT: '',
    vatRate: '20',
    dueDate: '',
    notes: '',
  });

  const [planningForm, setPlanningForm] = useState({
    missionId: '',
    truckId: '',
    dayOfWeek: '1',
    notes: '',
  });

  // Auth helpers
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const currentToken = token || localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
      ...options.headers,
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleLogout();
      throw new Error('Non autorisé');
    }
    return res;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(API_BASE_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!res.ok) {
        throw new Error('Identifiants invalides');
      }
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
      setShowLogin(false);
    } catch (err: any) {
      setLoginError(err.message || 'Une erreur est survenue lors de la connexion.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setShowLogin(false);
  };

  // Load all data from API
  const loadAllData = async () => {
    if (!isAuthenticated) return;
    try {
      const { year, week } = getISOWeekAndYear(new Date());

      const [
        missionsRes,
        trucksRes,
        clientsRes,
        worksitesRes,
        statsRes,
        planningRes,
        reportsRes,
        stockItemsRes,
        employeesRes,
        equipmentsRes,
        quotesRes,
        invoicesRes,
        assignmentsRes,
        auditRes
      ] = await Promise.all([
        fetchWithAuth(API_BASE_URL + '/missions'),
        fetchWithAuth(API_BASE_URL + '/trucks'),
        fetchWithAuth(API_BASE_URL + '/clients'),
        fetchWithAuth(API_BASE_URL + '/worksites'),
        fetchWithAuth(API_BASE_URL + '/stats/dashboard'),
        fetchWithAuth(`${API_BASE_URL}/planning/week?year=${year}&week=${week}`),
        fetchWithAuth(API_BASE_URL + '/reports'),
        fetchWithAuth(API_BASE_URL + '/stock-items'),
        fetchWithAuth(API_BASE_URL + '/employees'),
        fetchWithAuth(API_BASE_URL + '/equipments'),
        fetchWithAuth(API_BASE_URL + '/billing/quotes'),
        fetchWithAuth(API_BASE_URL + '/billing/invoices'),
        fetchWithAuth(API_BASE_URL + '/trucks/assignments/all'),
        fetchWithAuth(API_BASE_URL + '/audit').catch(() => null), // Fail-safe
      ]);

      const mData = await missionsRes.json();
      const trucksData = await trucksRes.json();
      
      setMissions(mData);
      setTrucks(trucksData);
      setClients(await clientsRes.json());
      setWorksites(await worksitesRes.json());
      setStats(await statsRes.json());
      setWeeklyPlanning(await planningRes.json());
      setReports(await reportsRes.json());
      setStockItems(await stockItemsRes.json());
      setEmployees(await employeesRes.json());
      setEquipments(await equipmentsRes.json());
      setQuotes(await quotesRes.json());
      setInvoices(await invoicesRes.json());
      
      if (assignmentsRes.ok) {
        setAssignments(await assignmentsRes.json());
      }
      if (auditRes && auditRes.ok) {
        setAuditLogs(await auditRes.json());
      }

      // Fetch stock movements for first truck if available
      if (trucksData.length > 0) {
        const movementsRes = await fetchWithAuth(`${API_BASE_URL}/stock/truck/${trucksData[0].id}`);
        if (movementsRes.ok) {
          setStockMovements(await movementsRes.json());
        }
      }

      // Populate photos dynamically from missions
      const allPhotos: any[] = [];
      await Promise.all(
        mData.map(async (m: Mission) => {
          const photoRes = await fetchWithAuth(`${API_BASE_URL}/photos/mission/${m.id}`);
          if (photoRes.ok) {
            const photos = await photoRes.json();
            photos.forEach((ph: any) => {
              allPhotos.push({
                ...ph,
                missionTitle: m.title,
              });
            });
          }
        })
      );
      setPhotosList(allPhotos);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }
  };

  // Trigger loads
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, activeTab]);

  // Load live positions for Map
  useEffect(() => {
    if (activeTab === 'gps' && isAuthenticated) {
      fetchWithAuth(API_BASE_URL + '/gps/live')
        .then(res => res.json())
        .then(data => setLivePositions(data))
        .catch(err => console.error('Erreur live positions:', err));
    }
  }, [activeTab, isAuthenticated]);

  // Load Leaflet Map for live tracking in Dashboard/GPS tab
  useEffect(() => {
    if (activeTab === 'gps' || activeTab === 'dashboard') {
      const mapContainer = document.getElementById('map');
      if (mapContainer && (window as any).L) {
        // Clean map if already initialized
        const container = (mapContainer as any);
        if (container._leaflet_id) {
          container.innerHTML = '';
          container._leaflet_id = null;
        }

        const map = (window as any).L.map('map').setView([44.3644, 4.7086], 11); // Grillon, Vaucluse coords
        (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Add main zone (Grillon area circle)
        (window as any).L.circle([44.3644, 4.7086], {
          color: '#f26522',
          fillColor: '#f26522',
          fillOpacity: 0.05,
          radius: 5000 // 5km circle
        }).addTo(map);

        // Add live positions
        livePositions.forEach(pos => {
          if (pos.latitude && pos.longitude) {
            const marker = (window as any).L.marker([pos.latitude, pos.longitude]).addTo(map);
            const isOut = pos.isOutOfZone ? '<b style="color: red;">[HORS ZONE]</b>' : '<b style="color: green;">[Zone OK]</b>';
            marker.bindPopup(`<b>${pos.truckPlate || 'Camion'}</b><br/>${isOut}<br/>Vitesse: ${pos.speed || 0} km/h<br/>Relevé: ${new Date(pos.timestamp).toLocaleTimeString('fr-FR')}`);
          }
        });
      }
    }
  }, [activeTab, livePositions]);

  // Devis form submission handler
  const handlePublicDevis = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Form unique number
      const quoteNum = 'DEV-' + Math.floor(1000 + Math.random() * 9000);
      const lines = [{ description: `Prestation ${devisForm.prestation} - Surface estimée: ${devisForm.surface}m²`, quantity: Number(devisForm.surface) || 1, unitPrice: 35 }];
      
      const payload = {
        quoteNumber: quoteNum,
        clientName: devisForm.name,
        clientEmail: devisForm.email,
        clientPhone: devisForm.phone,
        clientAddress: devisForm.address,
        totalHT: (Number(devisForm.surface) || 1) * 35,
        vatRate: 20,
        notes: `Demande de devis en ligne - Descriptif: ${devisForm.description}`,
        lines
      };

      // Call api if available, otherwise fallback
      await fetch(API_BASE_URL + '/billing/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.log('Backend not fully initialized for public devis', err));

      setDevisSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD handlers: Missions
  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newMission.title,
        type: newMission.type,
        clientName: newMission.clientName,
        worksiteAddress: newMission.worksiteAddress,
        description: newMission.description,
        scheduledDate: new Date(newMission.scheduledDate).toISOString(),
        estimatedPrice: Number(newMission.estimatedPrice),
        truckId: newMission.truckId || undefined,
        surfaceArea: Number(newMission.surfaceArea) || undefined,
      };

      const res = await fetchWithAuth(API_BASE_URL + '/missions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNewMission({
          title: '',
          type: 'Sablage',
          clientName: '',
          worksiteAddress: '',
          description: '',
          scheduledDate: '',
          estimatedPrice: '',
          truckId: '',
          surfaceArea: '',
        });
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMissionStatus = async (id: string, status: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/missions/${id}/status/${status}`, {
        method: 'PATCH',
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette mission ?')) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/missions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD handlers: Trucks
  const handleCreateOrUpdateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        plateNumber: newTruck.plateNumber,
        model: newTruck.model,
        year: Number(newTruck.year) || undefined,
        pinCode: newTruck.pinCode,
        stockAlertThreshold: Number(newTruck.stockAlertThreshold) || 10,
        controlTechniqueDate: newTruck.controlTechniqueDate ? new Date(newTruck.controlTechniqueDate).toISOString() : undefined,
        insuranceExpirationDate: newTruck.insuranceExpirationDate ? new Date(newTruck.insuranceExpirationDate).toISOString() : undefined,
        lastServiceDate: newTruck.lastServiceDate ? new Date(newTruck.lastServiceDate).toISOString() : undefined,
        mileage: Number(newTruck.mileage) || 0,
      };

      const url = editingTruckId 
        ? `${API_BASE_URL}/trucks/${editingTruckId}` 
        : `${API_BASE_URL}/trucks`;
      
      const method = editingTruckId ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNewTruck({
          plateNumber: '',
          model: '',
          year: '',
          pinCode: '',
          stockAlertThreshold: '10',
          controlTechniqueDate: '',
          insuranceExpirationDate: '',
          lastServiceDate: '',
          mileage: '0',
        });
        setEditingTruckId(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTruck = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/trucks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTruckStock = async (truckId: string, quantity: number) => {
    try {
      const res = await fetchWithAuth(API_BASE_URL + '/stock/movement', {
        method: 'POST',
        body: JSON.stringify({
          truckId,
          type: quantity > 0 ? 'load' : 'consume',
          quantity: Math.abs(quantity),
          notes: 'Mise à jour rapide depuis le backoffice',
        }),
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD handlers: Employees
  const handleCreateOrUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        badgeNumber: newEmployee.badgeNumber,
        pin: newEmployee.pin,
        hourlyRate: Number(newEmployee.hourlyRate) || 45,
        phone: newEmployee.phone,
        email: newEmployee.email,
        qualification: newEmployee.qualification,
      };

      const url = editingEmployeeId 
        ? `${API_BASE_URL}/employees/${editingEmployeeId}` 
        : `${API_BASE_URL}/employees`;
      const method = editingEmployeeId ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNewEmployee({
          firstName: '',
          lastName: '',
          badgeNumber: '',
          pin: '',
          hourlyRate: '45',
          phone: '',
          email: '',
          qualification: 'Ouvrier Qualifié',
        });
        setEditingEmployeeId(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment désactiver ce salarié ?')) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD handlers: Equipment
  const handleCreateOrUpdateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newEquipment.name,
        serialNumber: newEquipment.serialNumber,
        status: newEquipment.status,
        purchaseDate: newEquipment.purchaseDate ? new Date(newEquipment.purchaseDate).toISOString() : undefined,
        nextMaintenanceDate: newEquipment.nextMaintenanceDate ? new Date(newEquipment.nextMaintenanceDate).toISOString() : undefined,
        notes: newEquipment.notes,
        assignedTruckId: newEquipment.assignedTruckId || undefined,
      };

      const url = editingEquipmentId 
        ? `${API_BASE_URL}/equipments/${editingEquipmentId}` 
        : `${API_BASE_URL}/equipments`;
      const method = editingEquipmentId ? 'PUT' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNewEquipment({
          name: '',
          serialNumber: '',
          status: 'Disponible',
          purchaseDate: '',
          nextMaintenanceDate: '',
          notes: '',
          assignedTruckId: '',
        });
        setEditingEquipmentId(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet équipement ?')) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/equipments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD handlers: Quotes (Devis)
  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let lines = [];
      try {
        lines = JSON.parse(newQuoteForm.linesText || '[]');
      } catch {
        lines = [{ description: newQuoteForm.linesText || 'Prestation sablage', quantity: 1, unitPrice: Number(newQuoteForm.totalHT) || 0 }];
      }

      const payload = {
        clientId: newQuoteForm.clientId,
        missionId: newQuoteForm.missionId || undefined,
        quoteNumber: newQuoteForm.quoteNumber || 'DEV-' + Math.floor(1000 + Math.random() * 9000),
        lines,
        totalHT: Number(newQuoteForm.totalHT),
        vatRate: Number(newQuoteForm.vatRate) || 20,
        notes: newQuoteForm.notes,
        date: new Date().toISOString(),
      };

      const res = await fetchWithAuth(API_BASE_URL + '/billing/quotes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNewQuoteForm({
          clientId: '',
          missionId: '',
          quoteNumber: '',
          linesText: '',
          totalHT: '',
          vatRate: '20',
          notes: '',
        });
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertQuote = async (quoteId: string) => {
    try {
      const invoiceNumber = 'FAC-' + Math.floor(1000 + Math.random() * 9000);
      const res = await fetchWithAuth(`${API_BASE_URL}/billing/quotes/${quoteId}/convert`, {
        method: 'POST',
        body: JSON.stringify({ invoiceNumber }),
      });
      if (res.ok) {
        loadAllData();
        setActiveTab('invoices');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD handlers: Invoices (Factures)
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let lines = [];
      try {
        lines = JSON.parse(newInvoiceForm.linesText || '[]');
      } catch {
        lines = [{ description: newInvoiceForm.linesText || 'Facture sablage', quantity: 1, unitPrice: Number(newInvoiceForm.totalHT) || 0 }];
      }

      const payload = {
        clientId: newInvoiceForm.clientId,
        quoteId: newInvoiceForm.quoteId || undefined,
        invoiceNumber: newInvoiceForm.invoiceNumber || 'FAC-' + Math.floor(1000 + Math.random() * 9000),
        lines,
        totalHT: Number(newInvoiceForm.totalHT),
        vatRate: Number(newInvoiceForm.vatRate) || 20,
        dueDate: newInvoiceForm.dueDate ? new Date(newInvoiceForm.dueDate).toISOString() : undefined,
        notes: newInvoiceForm.notes,
        date: new Date().toISOString(),
      };

      const res = await fetchWithAuth(API_BASE_URL + '/billing/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNewInvoiceForm({
          clientId: '',
          quoteId: '',
          invoiceNumber: '',
          linesText: '',
          totalHT: '',
          vatRate: '20',
          dueDate: '',
          notes: '',
        });
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInvoiceStatus = async (id: string, status: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/billing/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Driver PV Lookup
  const handlePvLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setPvResult(null);
    try {
      const dt = new Date(`${pvLookup.date}T${pvLookup.time}`);
      const res = await fetchWithAuth(`${API_BASE_URL}/trucks/${pvLookup.truckId}/assignment-at?timestamp=${dt.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setPvResult(data);
      } else {
        setPvResult({ error: "Aucun conducteur n'était affecté à cette date/heure." });
      }
    } catch (err) {
      setPvResult({ error: "Erreur lors de la recherche." });
    }
  };

  // Stock Items Management
  const handleCreateStockItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth(API_BASE_URL + '/stock-items', {
        method: 'POST',
        body: JSON.stringify(newStockItem),
      });
      if (res.ok) {
        setNewStockItem({ name: '', unit: 'pcs' });
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStockItem = async (id: string) => {
    if (!window.confirm('Supprimer ce type de stock ?')) return;
    try {
      await fetchWithAuth(`${API_BASE_URL}/stock-items/${id}`, {
        method: 'DELETE',
      });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Assign equipment/stock to Truck
  const handleAssignStockToTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth(API_BASE_URL + '/truck-stocks', {
        method: 'POST',
        body: JSON.stringify({
          truckId: selectedTruckForStock,
          stockItemId: stockItemToAssign,
          quantity: Number(assignQuantity) || 1,
        }),
      });
      if (res.ok) {
        setStockItemToAssign('');
        setAssignQuantity('1');
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStockFromTruck = async (id: string) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/truck-stocks/${id}`, {
        method: 'DELETE',
      });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Weekly planning
  const handleAddToPlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        missionId: planningForm.missionId,
        truckId: planningForm.truckId || undefined,
        dayOfWeek: Number(planningForm.dayOfWeek),
        notes: planningForm.notes,
      };

      const res = await fetchWithAuth(API_BASE_URL + '/planning', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPlanningForm({
          missionId: '',
          truckId: '',
          dayOfWeek: '1',
          notes: '',
        });
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFromPlanning = async (id: string) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/planning/${id}`, {
        method: 'DELETE',
      });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Reports
  const handleGenerateReport = async (missionId: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/reports/generate/${missionId}`, {
        method: 'POST',
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
      alert('Erreur de génération de rapport.');
    }
  };

  // ----------------------------------------------------
  // PUBLIC WEBSITE (VITRINE) RENDER
  // ----------------------------------------------------
  if (!isAuthenticated && !showLogin) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#121214', color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
        {/* Navigation Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 60px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, backgroundColor: 'rgba(18,18,20,0.9)', backdropFilter: 'blur(10px)', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(135deg, #f26522 0%, #ff8e53 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EDGS
            </div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px', color: 'var(--text-secondary)' }}>
              Sablage • Bouchardage • Ponçage
            </div>
          </div>
          
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#services" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'var(--transition)' }} className="nav-hover">Savoir-Faire</a>
            <a href="#devis" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }} className="nav-hover">Demande de Devis</a>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowLogin(true)} 
              style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Lock size={14} /> Espace Client / Admin
            </button>
          </nav>
        </header>

        {/* Hero Section */}
        <section style={{ padding: '120px 60px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(242,101,34,0.06) 0%, transparent 60%)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', backgroundColor: 'var(--primary-glow)', border: '1px solid rgba(242,101,34,0.15)', color: 'var(--primary)', fontWeight: '600', fontSize: '13px', marginBottom: '24px' }}>
            <Info size={14} /> Traitement de Surfaces Industriel de Haute Qualité
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-2px', maxWidth: '900px', marginBottom: '24px' }}>
            Donnez une seconde jeunesse à vos <span style={{ background: 'linear-gradient(135deg, #f26522 0%, #ff8e53 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>sols et façades</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '650px', marginBottom: '40px', lineHeight: 1.6 }}>
            EDGS intervient sur tout type de chantier (sablage, bouchardage et ponçage) dans le Vaucluse et la région PACA. Performance technique et finitions impeccables garanties.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#devis" className="btn btn-primary" style={{ padding: '14px 28px', textDecoration: 'none', borderRadius: 'var(--radius-sm)', fontSize: '16px' }}>
              Demander mon Devis Gratuit
            </a>
            <a href="#services" className="btn btn-secondary" style={{ padding: '14px 28px', textDecoration: 'none', borderRadius: 'var(--radius-sm)', fontSize: '16px' }}>
              Nos Prestations
            </a>
          </div>
        </section>

        {/* Services / Savoir-Faire Section */}
        <section id="services" style={{ padding: '80px 60px', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '12px' }}>Notre Savoir-Faire</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '60px' }}>Des solutions adaptées à chaque support et à chaque exigence de finition.</p>
          
          <div className="grid-3">
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(242,101,34,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Coins size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Sablage Professionnel</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Nettoyage abrasif à haute pression pour enlever la rouille, la peinture, la suie ou la saleté sur le métal, le bois et la pierre. Idéal pour façades et poutres.
              </p>
            </div>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(242,101,34,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Wrench size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Bouchardage</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Création de rugosités antidérapantes sur dalles béton et pierres naturelles. Garantit la sécurité des usagers en extérieur et en intérieur.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(242,101,34,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Ponçage & Polissage</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Rectification de dalles béton, élimination de résidus de colles ou de résines et polissage pour obtenir un sol lisse et esthétique.
              </p>
            </div>
          </div>
        </section>

        {/* Devis Form Section */}
        <section id="devis" style={{ padding: '80px 60px', backgroundColor: '#16181d', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '12px' }}>Demande de Devis Express</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '40px' }}>Calculez le budget estimatif de vos travaux en 1 minute.</p>
            
            {devisSubmitted ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px', borderColor: 'var(--success)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--success-glow)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>Demande Enregistrée !</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Votre demande de devis a bien été transmise à notre service technique. Un conseiller va vous recontacter par téléphone sous 24h.
                </p>
                <button className="btn btn-secondary" onClick={() => setDevisSubmitted(false)}>
                  Faire une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handlePublicDevis} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nom Complet / Entreprise</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Jean Dupont" 
                      value={devisForm.name}
                      onChange={e => setDevisForm({ ...devisForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Adresse Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="jean.dupont@gmail.com" 
                      value={devisForm.email}
                      onChange={e => setDevisForm({ ...devisForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Numéro de Téléphone</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="06 12 34 56 78" 
                      value={devisForm.phone}
                      onChange={e => setDevisForm({ ...devisForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Adresse des Travaux / Localisation</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Grillon, 84600" 
                      value={devisForm.address}
                      onChange={e => setDevisForm({ ...devisForm, address: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Type de Prestation</label>
                    <select 
                      className="form-input" 
                      value={devisForm.prestation} 
                      onChange={e => setDevisForm({ ...devisForm, prestation: e.target.value })}
                    >
                      <option value="Sablage">Sablage</option>
                      <option value="Bouchardage">Bouchardage</option>
                      <option value="Ponçage">Ponçage</option>
                      <option value="Autre">Autre prestation</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Surface Estimée (m²)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 150" 
                      value={devisForm.surface}
                      onChange={e => setDevisForm({ ...devisForm, surface: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description du projet (Optionnel)</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Précisez ici les détails du support (béton, pierre, poutres, état actuel)..." 
                    rows={4}
                    value={devisForm.description}
                    onChange={e => setDevisForm({ ...devisForm, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Send size={18} /> Envoyer ma Demande de Devis
                </button>
              </form>
            )}
          </div>
        </section>

        <footer style={{ padding: '40px 60px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '13px' }}>
          © {new Date().getFullYear()} EDGS Sablage. Tous droits réservés. Grillon, Vaucluse.
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // LOGIN FORM RENDER
  // ----------------------------------------------------
  if (!isAuthenticated && showLogin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', alignItems: 'center', justifyContent: 'center', padding: '20px', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #f26522 0%, #ff8e53 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px', marginBottom: '8px' }}>
              EDGS Manager
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Portail d'administration de sablage industriel</p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Adresse Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="nom@edgs.fr"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
              Se connecter
            </button>
          </form>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={() => setShowLogin(false)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Retour au site public
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED PANEL RENDER
  // ----------------------------------------------------
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar" style={{ width: '280px', height: '100vh', overflowY: 'auto' }}>
        <div className="brand" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="brand-logo" style={{ fontSize: '22px', fontWeight: '800' }}>EDGS Manager</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pilotage & Rentabilité</div>
          </div>
        </div>
        
        <nav className="nav-menu" style={{ gap: '4px' }}>
          {/* TAB 1: TABLEAU DE BORD */}
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} />
            Tableau de Bord
          </div>
          
          {/* TAB 2: MISSIONS & CHANTIERS */}
          <div className={`nav-item ${activeTab === 'missions' ? 'active' : ''}`} onClick={() => setActiveTab('missions')}>
            <Briefcase size={18} />
            Missions & Chantiers
          </div>

          {/* TAB 3: PLANNING WEEK */}
          <div className={`nav-item ${activeTab === 'planning' ? 'active' : ''}`} onClick={() => setActiveTab('planning')}>
            <Calendar size={18} />
            Planning Hebdomadaire
          </div>

          {/* TAB 4: GPS MAP */}
          <div className={`nav-item ${activeTab === 'gps' ? 'active' : ''}`} onClick={() => setActiveTab('gps')}>
            <MapPin size={18} />
            Cartographie GPS & Zone
          </div>

          {/* TAB 5: PHOTOS */}
          <div className={`nav-item ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
            <ImageIcon size={18} />
            Photos Chantiers
          </div>

          {/* TAB 6: REPORTS */}
          <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <FileText size={18} />
            Rapports d'Intervention
          </div>

          {/* TAB 7: CAMIONS */}
          <div className={`nav-item ${activeTab === 'trucks' ? 'active' : ''}`} onClick={() => setActiveTab('trucks')}>
            <TruckIcon size={18} />
            Parc Véhicules
          </div>

          {/* TAB 8: DRIVER ASSIGNMENTS */}
          <div className={`nav-item ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
            <UserCheck size={18} />
            Affectation Conducteurs
          </div>

          {/* TAB 9: STOCKS */}
          <div className={`nav-item ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>
            <Package size={18} />
            Gestion des Stocks
          </div>

          {/* TAB 10: EQUIPMENT */}
          <div className={`nav-item ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>
            <Wrench size={18} />
            Équipements & Matériel
          </div>

          {/* TAB 11: EMPLOYEES */}
          <div className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
            <Users size={18} />
            Fiches Salariés
          </div>

          {/* TAB 12: DEVIS */}
          <div className={`nav-item ${activeTab === 'quotes' ? 'active' : ''}`} onClick={() => setActiveTab('quotes')}>
            <FileSpreadsheet size={18} />
            Gestion des Devis
          </div>

          {/* TAB 13: FACTURES */}
          <div className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
            <Receipt size={18} />
            Facturation
          </div>

          {/* TAB 14: AUDIT */}
          <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            <HistoryIcon size={18} />
            Historique & Audit
          </div>
        </nav>

        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px' }}>
          <div className="glass-card" style={{ padding: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '600' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              EDGS API Connectée
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              Admin: {user?.firstName || 'Edgs'}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', gap: '8px', padding: '8px' }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ marginLeft: '280px', padding: '32px' }}>
        
        {/* TAB 1: PILOTAGE DASHBOARD */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Tableau de bord EDGS</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Indicateurs opérationnels et financiers consolidés.</p>
            </div>

            {/* KPIs Grid */}
            <div className="grid-3" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="glass-card">
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Salariés Présents</div>
                <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px', color: 'var(--primary)' }}>
                  {stats.kpis?.salariésPrésentsActive} / {stats.kpis?.salariésPrésentsTotal}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Sur le terrain aujourd'hui</p>
              </div>

              <div className="glass-card">
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Chantiers Actifs</div>
                <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px', color: '#10b981' }}>
                  {stats.kpis?.chantiersEnCoursCount}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Missions en cours aujourd'hui</p>
              </div>

              <div className="glass-card">
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Heures Pointées</div>
                <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px', color: '#eab308' }}>
                  {stats.kpis?.heuresPointéesToday}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Cumul pointages de la journée</p>
              </div>

              <div className="glass-card">
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Surface Réalisée</div>
                <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px', color: '#a855f7' }}>
                  {stats.kpis?.m2RealisesToday} m²
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Production validée aujourd'hui</p>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '32px' }}>
              {/* Warnings and Alerts */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} color="var(--primary)" /> Alertes & Conformité Flotte/Matériel
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '300px' }}>
                  {stats.alertes?.map((a: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: a.severity === 'high' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)' }}>
                      <AlertTriangle size={18} color={a.severity === 'high' ? '#ef4444' : '#f59e0b'} style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{a.message}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Type: {a.type}</div>
                      </div>
                    </div>
                  ))}
                  {(!stats.alertes || stats.alertes.length === 0) && (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Aucune alerte de maintenance ou d'assurance en cours. Flotte conforme.
                    </div>
                  )}
                </div>
              </div>

              {/* Real time GPS Map placeholder */}
              <div className="glass-card" style={{ minHeight: '300px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Suivi GPS - Zone de Grillon</h3>
                <div id="map" style={{ height: '240px', borderRadius: 'var(--radius-sm)' }}></div>
              </div>
            </div>

            {/* Profitability summary */}
            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Rentabilité Analytique des Chantiers</h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Chantier</th>
                      <th>Client</th>
                      <th>Avancement</th>
                      <th>CA Prévu</th>
                      <th>CA Réalisé</th>
                      <th>Coût Réel (Main d'œuvre + Déplacements)</th>
                      <th>Marge Brute</th>
                      <th>Marge (%)</th>
                      <th>Alerte Marge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.rentabilitéChantiers?.map((r: any) => {
                      const isLowMargin = r.tauxMarge < 25; // Alert if margin < 25%
                      return (
                        <tr key={r.id}>
                          <td style={{ fontWeight: '600' }}>{r.title}</td>
                          <td>{r.clientName}</td>
                          <td style={{ fontWeight: '700' }}>{r.progress}%</td>
                          <td>{r.caPrevu.toLocaleString('fr-FR')} €</td>
                          <td style={{ color: '#10b981', fontWeight: '600' }}>{r.caRealise.toLocaleString('fr-FR')} €</td>
                          <td style={{ color: 'var(--text-muted)' }}>{r.coutReel.toLocaleString('fr-FR')} €</td>
                          <td style={{ fontWeight: '700', color: r.margeBrute >= 0 ? '#10b981' : '#ef4444' }}>{r.margeBrute.toLocaleString('fr-FR')} €</td>
                          <td style={{ fontWeight: '700' }}>{r.tauxMarge}%</td>
                          <td>
                            {isLowMargin ? (
                              <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={12} /> Marge Faible
                              </span>
                            ) : (
                              <span className="badge badge-success">Marge Conforme</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MISSIONS & CHANTIERS */}
        {activeTab === 'missions' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Missions & Chantiers</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Créez et suivez le statut des interventions.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Créer une Mission</h3>
                <form onSubmit={handleCreateMission}>
                  <div className="form-group">
                    <label className="form-label">Titre du Chantier</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Sablage parking Mairie" 
                      value={newMission.title}
                      onChange={e => setNewMission({ ...newMission, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type de Prestation</label>
                    <select 
                      className="form-input" 
                      value={newMission.type}
                      onChange={e => setNewMission({ ...newMission, type: e.target.value })}
                    >
                      <option value="Sablage">Sablage</option>
                      <option value="Bouchardage">Bouchardage</option>
                      <option value="Ponçage">Ponçage</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Client (Texte Libre)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Nom du client" 
                      value={newMission.clientName}
                      onChange={e => setNewMission({ ...newMission, clientName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Adresse (Texte Libre)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Adresse complète" 
                      value={newMission.worksiteAddress}
                      onChange={e => setNewMission({ ...newMission, worksiteAddress: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date planifiée</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={newMission.scheduledDate}
                      onChange={e => setNewMission({ ...newMission, scheduledDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Surface Estimée (m²)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={newMission.surfaceArea}
                      onChange={e => setNewMission({ ...newMission, surfaceArea: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prix Estimé (€ HT)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={newMission.estimatedPrice}
                      onChange={e => setNewMission({ ...newMission, estimatedPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Camion Assigné</label>
                    <select 
                      className="form-input" 
                      value={newMission.truckId}
                      onChange={e => setNewMission({ ...newMission, truckId: e.target.value })}
                    >
                      <option value="">Sélectionner un véhicule...</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>{t.plateNumber} ({t.model})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description / Instructions</label>
                    <textarea 
                      className="form-input" 
                      rows={3} 
                      value={newMission.description}
                      onChange={e => setNewMission({ ...newMission, description: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Planifier la Mission
                  </button>
                </form>
              </div>

              {/* Missions list */}
              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Chantiers Enregistrés</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Titre / Type</th>
                        <th>Client / Adresse</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Surface</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missions.map(m => (
                        <tr key={m.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{m.title}</div>
                            <span className="badge badge-info" style={{ marginTop: '4px' }}>{m.type || 'Sablage'}</span>
                          </td>
                          <td>
                            <div>{m.clientName || m.client?.name || '--'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.worksiteAddress || m.worksite?.address || '--'}</div>
                          </td>
                          <td>{new Date(m.scheduledDate).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <select 
                              className="form-input" 
                              style={{ padding: '6px 12px', width: 'auto', fontSize: '13px' }}
                              value={m.status}
                              onChange={(e) => handleUpdateMissionStatus(m.id, e.target.value)}
                            >
                              <option value="planned">Planifiée</option>
                              <option value="in_progress">En cours</option>
                              <option value="completed">Terminée</option>
                              <option value="cancelled">Annulée</option>
                            </select>
                          </td>
                          <td>{m.surfaceArea ? `${m.surfaceArea} m²` : '--'}</td>
                          <td>
                            <button className="btn btn-danger" style={{ padding: '6px 12px', backgroundColor: '#dc2626', color: '#fff' }} onClick={() => handleDeleteMission(m.id)}>
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEEKLY PLANNING */}
        {activeTab === 'planning' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Planning Hebdomadaire</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Affectez les camions et configurez le planning de la semaine courante.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Ajouter au Planning</h3>
                <form onSubmit={handleAddToPlanning}>
                  <div className="form-group">
                    <label className="form-label">Mission / Chantier</label>
                    <select 
                      className="form-input" 
                      value={planningForm.missionId} 
                      onChange={e => setPlanningForm({ ...planningForm, missionId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner une mission...</option>
                      {missions.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Véhicule</label>
                    <select 
                      className="form-input" 
                      value={planningForm.truckId} 
                      onChange={e => setPlanningForm({ ...planningForm, truckId: e.target.value })}
                    >
                      <option value="">Sélectionner un véhicule...</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>{t.plateNumber} - {t.model}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jour de la Semaine</label>
                    <select 
                      className="form-input" 
                      value={planningForm.dayOfWeek} 
                      onChange={e => setPlanningForm({ ...planningForm, dayOfWeek: e.target.value })}
                    >
                      <option value="1">Lundi</option>
                      <option value="2">Mardi</option>
                      <option value="3">Mercredi</option>
                      <option value="4">Jeudi</option>
                      <option value="5">Vendredi</option>
                      <option value="6">Samedi</option>
                      <option value="7">Dimanche</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes de planning</label>
                    <textarea 
                      className="form-input" 
                      value={planningForm.notes} 
                      onChange={e => setPlanningForm({ ...planningForm, notes: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Enregistrer au planning
                  </button>
                </form>
              </div>

              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Emploi du temps de la semaine</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((dayName, idx) => {
                    const dayIdx = idx + 1;
                    const dayEntries = weeklyPlanning.filter(e => e.dayOfWeek === dayIdx);
                    return (
                      <div key={dayIdx} style={{ padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>{dayName}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {dayEntries.map(e => (
                            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div>
                                <span style={{ fontWeight: '600' }}>{e.mission?.title}</span>
                                {e.truck && <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '12px' }}>Camion: {e.truck.plateNumber}</span>}
                                {e.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Note: {e.notes}</div>}
                              </div>
                              <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleRemoveFromPlanning(e.id)}>
                                Retirer
                              </button>
                            </div>
                          ))}
                          {dayEntries.length === 0 && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aucun chantier programmé ce jour.</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GPS CARTOGRAPHY */}
        {activeTab === 'gps' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Cartographie GPS & Zone</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Suivez en direct la position des véhicules. Une alerte se déclenche s'ils sortent du périmètre de 100m du chantier.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Carte Live (OSM)</h3>
                <div id="map" style={{ height: '480px', borderRadius: 'var(--radius-md)' }}></div>
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Véhicules Actifs</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {livePositions.map((pos, idx) => (
                    <div key={idx} style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700' }}>{pos.truckPlate || 'Camion'}</span>
                        <span className={`badge ${pos.isOutOfZone ? 'badge-danger' : 'badge-success'}`}>
                          {pos.isOutOfZone ? 'HORS ZONE (100m+)' : 'Dans la zone'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        <div>Vitesse: {pos.speed || 0} km/h</div>
                        <div>Dernière position: {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Heure: {new Date(pos.timestamp).toLocaleTimeString('fr-FR')}</div>
                      </div>
                    </div>
                  ))}
                  {livePositions.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                      Aucun véhicule ne transmet actuellement sa position.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PHOTOS GALLERY */}
        {activeTab === 'photos' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Photos Chantiers</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Photos de chantiers prises depuis l'application mobile (Avant / Pendant / Après).</p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Galerie Photos Triées</h3>
              <div className="grid-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {photosList.map((p: any) => (
                  <div key={p.id} className="glass-card" style={{ padding: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <img 
                      src={p.url.startsWith('http') ? p.url : `${API_BASE_URL}${p.url}`} 
                      alt="Chantier" 
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{p.missionTitle || 'Sans Mission'}</div>
                      <span className={`badge ${p.category === 'avant' ? 'badge-info' : p.category === 'pendant' ? 'badge-warning' : 'badge-success'}`} style={{ marginTop: '4px', textTransform: 'capitalize' }}>
                        {p.category || 'Chantier'}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Ajoutée le : {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
                {photosList.length === 0 && (
                  <div style={{ gridColumn: 'span 4', textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 0' }}>
                    Aucune photo n'a encore été téléversée depuis l'application mobile.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Rapports d'Intervention</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Téléchargez et générez les fiches chantiers contenant les signatures et résumés.</p>
            </div>

            <div className="glass-card">
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Mission</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Rapport PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.filter(m => m.status === 'completed').map(m => {
                      const report = reports.find(r => r.mission?.id === m.id);
                      return (
                        <tr key={m.id}>
                          <td style={{ fontWeight: '600' }}>{m.title}</td>
                          <td>{m.clientName || m.client?.name || 'Client'}</td>
                          <td>{report ? new Date(report.createdAt).toLocaleDateString('fr-FR') : '--'}</td>
                          <td>
                            <span className="badge badge-success">Prêt</span>
                          </td>
                          <td>
                            {report ? (
                              <a 
                                href={report.url.startsWith('http') ? report.url : `${API_BASE_URL}${report.url}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                              >
                                <Download size={14} /> Télécharger
                              </a>
                            ) : (
                              <button className="btn btn-primary" onClick={() => handleGenerateReport(m.id)}>
                                Générer Rapport
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: VEHICLES */}
        {activeTab === 'trucks' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Parc Véhicules</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Ajoutez, modifiez ou supprimez les camions de la flotte EDGS.</p>
            </div>

            <div className="grid-3">
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                  {editingTruckId ? 'Modifier le Véhicule' : 'Ajouter un Véhicule'}
                </h3>
                <form onSubmit={handleCreateOrUpdateTruck}>
                  <div className="form-group">
                    <label className="form-label">Plaque d'immatriculation</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. AB-123-CD" 
                      value={newTruck.plateNumber}
                      onChange={e => setNewTruck({ ...newTruck, plateNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Modèle / Marque</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Renault Master" 
                      value={newTruck.model}
                      onChange={e => setNewTruck({ ...newTruck, model: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Année de mise en service</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 2021" 
                      value={newTruck.year}
                      onChange={e => setNewTruck({ ...newTruck, year: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code PIN (Camion = 1 code unique)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 1234" 
                      value={newTruck.pinCode}
                      onChange={e => setNewTruck({ ...newTruck, pinCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kilométrage (km)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={newTruck.mileage}
                      onChange={e => setNewTruck({ ...newTruck, mileage: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date de Contrôle Technique</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={newTruck.controlTechniqueDate}
                      onChange={e => setNewTruck({ ...newTruck, controlTechniqueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Échéance Assurance</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={newTruck.insuranceExpirationDate}
                      onChange={e => setNewTruck({ ...newTruck, insuranceExpirationDate: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingTruckId ? 'Enregistrer' : 'Créer'}
                    </button>
                    {editingTruckId && (
                      <button type="button" className="btn btn-secondary" onClick={() => { setEditingTruckId(null); setNewTruck({ plateNumber: '', model: '', year: '', pinCode: '', stockAlertThreshold: '10', controlTechniqueDate: '', insuranceExpirationDate: '', lastServiceDate: '', mileage: '0' }); }}>
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Véhicules Actifs</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Plaque</th>
                        <th>Modèle</th>
                        <th>PIN</th>
                        <th>Kilométrage</th>
                        <th>CT / Assurance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trucks.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: '700' }}>{t.plateNumber}</td>
                          <td>{t.model} ({t.year})</td>
                          <td style={{ fontFamily: 'monospace' }}>{t.pinCode || '--'}</td>
                          <td>{(t.mileage || 0).toLocaleString()} km</td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              CT: {t.controlTechniqueDate ? new Date(t.controlTechniqueDate).toLocaleDateString('fr-FR') : '--'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Assur: {t.insuranceExpirationDate ? new Date(t.insuranceExpirationDate).toLocaleDateString('fr-FR') : '--'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '13px' }} 
                                onClick={() => {
                                  setEditingTruckId(t.id);
                                  setNewTruck({
                                    plateNumber: t.plateNumber,
                                    model: t.model || '',
                                    year: String(t.year || ''),
                                    pinCode: t.pinCode || '',
                                    stockAlertThreshold: String(t.stockAlertThreshold || 10),
                                    controlTechniqueDate: t.controlTechniqueDate ? t.controlTechniqueDate.split('T')[0] : '',
                                    insuranceExpirationDate: t.insuranceExpirationDate ? t.insuranceExpirationDate.split('T')[0] : '',
                                    lastServiceDate: t.lastServiceDate ? t.lastServiceDate.split('T')[0] : '',
                                    mileage: String(t.mileage || 0),
                                  });
                                }}
                              >
                                Modifier
                              </button>
                              <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#dc2626', color: '#fff' }} onClick={() => handleDeleteTruck(t.id)}>
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: DRIVER ASSIGNMENTS (PV LOOKUP) */}
        {activeTab === 'assignments' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Affectation des Conducteurs</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Historique des conducteurs et module d'identification du chauffeur lors de la réception d'un procès-verbal (PV).</p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Identification pour PV</h3>
                <form onSubmit={handlePvLookup}>
                  <div className="form-group">
                    <label className="form-label">Véhicule concerné</label>
                    <select 
                      className="form-input" 
                      value={pvLookup.truckId} 
                      onChange={e => setPvLookup({ ...pvLookup, truckId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un véhicule...</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>{t.plateNumber} - {t.model}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date du PV</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={pvLookup.date} 
                      onChange={e => setPvLookup({ ...pvLookup, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Heure du PV</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      value={pvLookup.time} 
                      onChange={e => setPvLookup({ ...pvLookup, time: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Rechercher le Conducteur
                  </button>
                </form>

                {pvResult && (
                  <div style={{ marginTop: '24px', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>Résultat de la recherche</h4>
                    {pvResult.error ? (
                      <div style={{ color: 'var(--danger)', fontSize: '13px' }}>{pvResult.error}</div>
                    ) : (
                      <div style={{ fontSize: '13px' }}>
                        <div><b>Conducteur :</b> {pvResult.employee?.firstName} {pvResult.employee?.lastName}</div>
                        <div><b>Badge :</b> {pvResult.employee?.badgeNumber}</div>
                        <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Période d'affectation : du {new Date(pvResult.startDate).toLocaleString('fr-FR')} au {pvResult.endDate ? new Date(pvResult.endDate).toLocaleString('fr-FR') : 'Présent'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Historique Global des Affectations</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Véhicule</th>
                        <th>Chauffeur</th>
                        <th>Date de Début</th>
                        <th>Date de Fin</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: '600' }}>{a.truck?.plateNumber}</td>
                          <td>{a.employee?.firstName} {a.employee?.lastName}</td>
                          <td>{new Date(a.startDate).toLocaleString('fr-FR')}</td>
                          <td>{a.endDate ? new Date(a.endDate).toLocaleString('fr-FR') : <span className="badge badge-success">Actuel</span>}</td>
                          <td>{a.notes || '--'}</td>
                        </tr>
                      ))}
                      {assignments.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune affectation passée enregistrée.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: STOCKS (LOADING TRUCKS) */}
        {activeTab === 'stock' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Gestion des Stocks</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Définissez les types de consommables (sacs de ciment, disques, etc.) et gérez l'inventaire embarqué dans les camions.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Définir un Type de Consommable</h3>
                <form onSubmit={handleCreateStockItem}>
                  <div className="form-group">
                    <label className="form-label">Nom de l'élément</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Sac de ciment, Compresseur..." 
                      value={newStockItem.name}
                      onChange={e => setNewStockItem({ ...newStockItem, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unité de mesure</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. sacs, pcs" 
                      value={newStockItem.unit}
                      onChange={e => setNewStockItem({ ...newStockItem, unit: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Créer l'Élément
                  </button>
                </form>
              </div>

              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Chargement dans le Véhicule</h3>
                <form onSubmit={handleAssignStockToTruck} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Véhicule</label>
                    <select 
                      className="form-input" 
                      value={selectedTruckForStock} 
                      onChange={e => setSelectedTruckForStock(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>{t.plateNumber} - {t.model}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Consommable</label>
                    <select 
                      className="form-input" 
                      value={stockItemToAssign} 
                      onChange={e => setStockItemToAssign(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {stockItems.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ width: '120px', marginBottom: 0 }}>
                    <label className="form-label">Quantité</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={assignQuantity} 
                      onChange={e => setAssignQuantity(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
                    Charger
                  </button>
                </form>

                {selectedTruckForStock && (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Nom du Consommable</th>
                          <th>Quantité Actuelle</th>
                          <th>Unité</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(trucks.find(t => t.id === selectedTruckForStock)?.stocks || []).map((ts: any) => (
                          <tr key={ts.id}>
                            <td style={{ fontWeight: '600' }}>{ts.stockItem?.name}</td>
                            <td>{ts.quantity}</td>
                            <td>{ts.stockItem?.unit || 'pcs'}</td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleRemoveStockFromTruck(ts.id)}>
                                Retirer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: EQUIPMENT & MACHINERY */}
        {activeTab === 'equipment' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Équipements & Matériel</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Suivi du matériel technique de l'entreprise (compresseurs, sableuses, brosses rotatives).</p>
            </div>

            <div className="grid-3">
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                  {editingEquipmentId ? 'Modifier l\'Équipement' : 'Ajouter un Matériel'}
                </h3>
                <form onSubmit={handleCreateOrUpdateEquipment}>
                  <div className="form-group">
                    <label className="form-label">Nom de l'Équipement</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Compresseur de chantier" 
                      value={newEquipment.name}
                      onChange={e => setNewEquipment({ ...newEquipment, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Numéro de Série</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. S/N 482093" 
                      value={newEquipment.serialNumber}
                      onChange={e => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select 
                      className="form-input" 
                      value={newEquipment.status}
                      onChange={e => setNewEquipment({ ...newEquipment, status: e.target.value as any })}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="En maintenance">En maintenance</option>
                      <option value="En panne">En panne</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date d'achat</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={newEquipment.purchaseDate}
                      onChange={e => setNewEquipment({ ...newEquipment, purchaseDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prochaine visite d'entretien</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={newEquipment.nextMaintenanceDate}
                      onChange={e => setNewEquipment({ ...newEquipment, nextMaintenanceDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Camion assigné (Optionnel)</label>
                    <select 
                      className="form-input" 
                      value={newEquipment.assignedTruckId}
                      onChange={e => setNewEquipment({ ...newEquipment, assignedTruckId: e.target.value })}
                    >
                      <option value="">Non assigné...</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>{t.plateNumber} - {t.model}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes d'entretien / Observations</label>
                    <textarea 
                      className="form-input" 
                      value={newEquipment.notes}
                      onChange={e => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingEquipmentId ? 'Enregistrer' : 'Créer'}
                    </button>
                    {editingEquipmentId && (
                      <button type="button" className="btn btn-secondary" onClick={() => { setEditingEquipmentId(null); setNewEquipment({ name: '', serialNumber: '', status: 'Disponible', purchaseDate: '', nextMaintenanceDate: '', notes: '', assignedTruckId: '' }); }}>
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Matériel de l'entreprise</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Numéro de Série</th>
                        <th>Statut</th>
                        <th>Prochain Entretien</th>
                        <th>Assigné à</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipments.map(eq => (
                        <tr key={eq.id}>
                          <td style={{ fontWeight: '600' }}>{eq.name}</td>
                          <td>{eq.serialNumber}</td>
                          <td>
                            <span className={`badge ${eq.status === 'Disponible' ? 'badge-success' : eq.status === 'En maintenance' ? 'badge-warning' : 'badge-danger'}`}>
                              {eq.status}
                            </span>
                          </td>
                          <td>{eq.nextMaintenanceDate ? new Date(eq.nextMaintenanceDate).toLocaleDateString('fr-FR') : '--'}</td>
                          <td>{eq.truck ? <b>{eq.truck.plateNumber}</b> : <span style={{ color: 'var(--text-muted)' }}>Dépot</span>}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '13px' }} 
                                onClick={() => {
                                  setEditingEquipmentId(eq.id);
                                  setNewEquipment({
                                    name: eq.name,
                                    serialNumber: eq.serialNumber,
                                    status: eq.status,
                                    purchaseDate: eq.purchaseDate ? eq.purchaseDate.split('T')[0] : '',
                                    nextMaintenanceDate: eq.nextMaintenanceDate ? eq.nextMaintenanceDate.split('T')[0] : '',
                                    notes: eq.notes || '',
                                    assignedTruckId: eq.truck?.id || '',
                                  });
                                }}
                              >
                                Modifier
                              </button>
                              <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#dc2626', color: '#fff' }} onClick={() => handleDeleteEquipment(eq.id)}>
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: EMPLOYEES */}
        {activeTab === 'employees' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Fiches Salariés</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Fiches du personnel contenant le **coût horaire chargé** pour le calcul automatique de la rentabilité.</p>
            </div>

            <div className="grid-3">
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                  {editingEmployeeId ? 'Modifier le Salarié' : 'Ajouter un Salarié'}
                </h3>
                <form onSubmit={handleCreateOrUpdateEmployee}>
                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Jean" 
                      value={newEmployee.firstName}
                      onChange={e => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Dupont" 
                      value={newEmployee.lastName}
                      onChange={e => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Numéro de Badge</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. BDG-982" 
                      value={newEmployee.badgeNumber}
                      onChange={e => setNewEmployee({ ...newEmployee, badgeNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code PIN (Application mobile)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 9812" 
                      value={newEmployee.pin}
                      onChange={e => setNewEmployee({ ...newEmployee, pin: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Coût Horaire Chargé (€/h)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="45" 
                      value={newEmployee.hourlyRate}
                      onChange={e => setNewEmployee({ ...newEmployee, hourlyRate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newEmployee.phone}
                      onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={newEmployee.email}
                      onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualification / Rôle</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newEmployee.qualification}
                      onChange={e => setNewEmployee({ ...newEmployee, qualification: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingEmployeeId ? 'Enregistrer' : 'Créer'}
                    </button>
                    {editingEmployeeId && (
                      <button type="button" className="btn btn-secondary" onClick={() => { setEditingEmployeeId(null); setNewEmployee({ firstName: '', lastName: '', badgeNumber: '', pin: '', hourlyRate: '45', phone: '', email: '', qualification: 'Ouvrier Qualifié' }); }}>
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Liste du Personnel</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Identité</th>
                        <th>Badge</th>
                        <th>PIN</th>
                        <th>Coût Horaire Chargé</th>
                        <th>Contact</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id}>
                          <td style={{ fontWeight: '600' }}>{emp.firstName} {emp.lastName}</td>
                          <td>{emp.badgeNumber}</td>
                          <td style={{ fontFamily: 'monospace' }}>{emp.pin || '--'}</td>
                          <td style={{ fontWeight: '700' }}>{emp.hourlyRate || 35} € / h</td>
                          <td>
                            <div style={{ fontSize: '12px' }}>{emp.phone || '--'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{emp.email || '--'}</div>
                          </td>
                          <td>
                            <span className={`badge ${emp.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                              {emp.isActive !== false ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '13px' }} 
                                onClick={() => {
                                  setEditingEmployeeId(emp.id);
                                  setNewEmployee({
                                    firstName: emp.firstName,
                                    lastName: emp.lastName,
                                    badgeNumber: emp.badgeNumber,
                                    pin: emp.pin || '',
                                    hourlyRate: String(emp.hourlyRate || 35),
                                    phone: emp.phone || '',
                                    email: emp.email || '',
                                    qualification: emp.qualification || 'Ouvrier Qualifié',
                                  });
                                }}
                              >
                                Modifier
                              </button>
                              <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#dc2626', color: '#fff' }} onClick={() => handleDeleteEmployee(emp.id)}>
                                Désactiver
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: DEVIS */}
        {activeTab === 'quotes' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Gestion des Devis</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Éditez les devis clients et convertissez-les en factures en 1 clic.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Créer un Devis</h3>
                <form onSubmit={handleCreateQuote}>
                  <div className="form-group">
                    <label className="form-label">Client</label>
                    <select 
                      className="form-input" 
                      value={newQuoteForm.clientId}
                      onChange={e => setNewQuoteForm({ ...newQuoteForm, clientId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un client...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mission / Projet (Optionnel)</label>
                    <select 
                      className="form-input" 
                      value={newQuoteForm.missionId}
                      onChange={e => setNewQuoteForm({ ...newQuoteForm, missionId: e.target.value })}
                    >
                      <option value="">Non assigné...</option>
                      {missions.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Numéro de devis (e.g. DEV-2026-01)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="DEV-2026-01" 
                      value={newQuoteForm.quoteNumber}
                      onChange={e => setNewQuoteForm({ ...newQuoteForm, quoteNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lignes de devis (JSON ou Texte)</label>
                    <textarea 
                      className="form-input" 
                      placeholder='[{"description":"Sablage façade", "quantity":150, "unitPrice":35}]'
                      rows={4}
                      value={newQuoteForm.linesText}
                      onChange={e => setNewQuoteForm({ ...newQuoteForm, linesText: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total HT Manuel (€)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={newQuoteForm.totalHT}
                      onChange={e => setNewQuoteForm({ ...newQuoteForm, totalHT: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">TVA (%)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={newQuoteForm.vatRate}
                      onChange={e => setNewQuoteForm({ ...newQuoteForm, vatRate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes client</label>
                    <textarea 
                      className="form-input" 
                      value={newQuoteForm.notes}
                      onChange={e => setNewQuoteForm({ ...newQuoteForm, notes: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Enregistrer le Devis
                  </button>
                </form>
              </div>

              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Historique Devis</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>N° Devis</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Total HT</th>
                        <th>Total TTC</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map(q => (
                        <tr key={q.id}>
                          <td style={{ fontWeight: '700' }}>{q.quoteNumber}</td>
                          <td>{q.client?.name}</td>
                          <td>{new Date(q.date).toLocaleDateString('fr-FR')}</td>
                          <td>{q.totalHT.toLocaleString('fr-FR')} €</td>
                          <td style={{ fontWeight: '600' }}>{(q.totalHT * (1 + (q.vatRate || 20) / 100)).toLocaleString('fr-FR')} €</td>
                          <td>
                            <span className={`badge ${q.status === 'Facturé' || q.status === 'Accepté' ? 'badge-success' : q.status === 'Brouillon' ? 'badge-info' : 'badge-warning'}`}>
                              {q.status}
                            </span>
                          </td>
                          <td>
                            {q.status !== 'Facturé' && (
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleConvertQuote(q.id)}>
                                Convertir en Facture
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: INVOICES */}
        {activeTab === 'invoices' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Facturation</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Émettez les factures et gérez le suivi des encaissements.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Créer une Facture</h3>
                <form onSubmit={handleCreateInvoice}>
                  <div className="form-group">
                    <label className="form-label">Client</label>
                    <select 
                      className="form-input" 
                      value={newInvoiceForm.clientId}
                      onChange={e => setNewInvoiceForm({ ...newInvoiceForm, clientId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un client...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">N° Facture (e.g. FAC-2026-01)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="FAC-2026-01" 
                      value={newInvoiceForm.invoiceNumber}
                      onChange={e => setNewInvoiceForm({ ...newInvoiceForm, invoiceNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lignes de facture</label>
                    <textarea 
                      className="form-input" 
                      placeholder='[{"description":"Facture finale", "quantity":1, "unitPrice":5200}]'
                      rows={3}
                      value={newInvoiceForm.linesText}
                      onChange={e => setNewInvoiceForm({ ...newInvoiceForm, linesText: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total HT (€)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={newInvoiceForm.totalHT}
                      onChange={e => setNewInvoiceForm({ ...newInvoiceForm, totalHT: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Échéance de paiement</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={newInvoiceForm.dueDate}
                      onChange={e => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Enregistrer la Facture
                  </button>
                </form>
              </div>

              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Suivi Factures</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>N° Facture</th>
                        <th>Client</th>
                        <th>Date Échéance</th>
                        <th>Total TTC</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: '700' }}>{inv.invoiceNumber}</td>
                          <td>{inv.client?.name}</td>
                          <td>{new Date(inv.dueDate).toLocaleDateString('fr-FR')}</td>
                          <td style={{ fontWeight: '600' }}>{(inv.totalHT * (1 + (inv.vatRate || 20) / 100)).toLocaleString('fr-FR')} €</td>
                          <td>
                            <span className={`badge ${inv.status === 'Payé' ? 'badge-success' : inv.status === 'Retard' ? 'badge-danger' : 'badge-warning'}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td>
                            {inv.status !== 'Payé' && (
                              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleUpdateInvoiceStatus(inv.id, 'Payé')}>
                                Marquer comme Payée
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 14: HISTORIQUE & AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Historique & Audit</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Traces de toutes les actions et modifications effectuées sur la plateforme.</p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Journal d'activité</h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Horodatage</th>
                      <th>Utilisateur</th>
                      <th>Action</th>
                      <th>Type d'entité</th>
                      <th>ID de l'entité</th>
                      <th>Adresse IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td>{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                        <td>{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System / Guest'}</td>
                        <td style={{ fontWeight: '600' }}>{log.action}</td>
                        <td>{log.entityType || '--'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.entityId || '--'}</td>
                        <td>{log.ipAddress || '127.0.0.1'}</td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>Aucun log d'audit disponible.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
