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
  Info,
  Phone,
  Printer,
  Upload,
  X,
  Edit3,
  CheckSquare,
  XSquare
} from 'lucide-react';

// Interfaces matching TypeORM entities
interface Client {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  countryCode?: string;
}

interface SiteSupervisor {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  client?: Client;
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
  username?: string;
  monthlySalary?: number;
  paidLeaveBalance?: number;
  paidLeaveN?: number;
  paidLeaveN1?: number;
  hireDate?: string;
  rttBalance?: number;
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
  estimatedUnit?: string;
  actualQuantity?: number;
  actualUnit?: string;
  totalMaterialCost?: number;
  fuelConsumption?: number;
  sandBagsUsed?: number;
  truck?: Truck;
  client?: Client;
  siteSupervisor?: SiteSupervisor;
  worksite?: Worksite;
  notes?: string;
  chefDeMission?: Employee;
  employees?: Employee[];
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
  employees?: Employee[];
}

const getISOWeekAndYear = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: date.getUTCFullYear(), week: weekNo };
};

const getDateOfISOWeek = (w: number, y: number) => {
  const simple = new Date(y, 0, 1 + (w - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
};

function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'create_mission' | 'missions' | 'site_supervisors' | 'time_validation' | 'planning' | 'gps' | 'photos' | 'reports' | 'trucks' | 'assignments' | 'stock' | 'equipment' | 'employees' | 'quotes' | 'invoices' | 'audit' | 'leaves'
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
  const [planningYear, setPlanningYear] = useState<number>(getISOWeekAndYear(new Date()).year);
  const [planningWeek, setPlanningWeek] = useState<number>(getISOWeekAndYear(new Date()).week);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [planningView, setPlanningView] = useState<'week' | 'month'>('week');
  const [planningFilterMission, setPlanningFilterMission] = useState<string>('');
  const [planningFilterEmployee, setPlanningFilterEmployee] = useState<string>('');
  const [planningFilterShowLeaves, setPlanningFilterShowLeaves] = useState<boolean>(true);
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
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  // Conducteurs de travaux & validation des heures & métrés
  const [siteSupervisors, setSiteSupervisors] = useState<SiteSupervisor[]>([]);
  const [newSupervisor, setNewSupervisor] = useState({ firstName: '', lastName: '', phone: '', email: '', clientId: '' });
  const [editingSupervisorId, setEditingSupervisorId] = useState<string | null>(null);

  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [timeFilterEmployee, setTimeFilterEmployee] = useState('');
  const [timeFilterStartDate, setTimeFilterStartDate] = useState('');
  const [timeFilterEndDate, setTimeFilterEndDate] = useState('');
  const [timeFilterStatus, setTimeFilterStatus] = useState('');

  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [timeModalEntry, setTimeModalEntry] = useState<any>(null);
  const [timeModalStatus, setTimeModalStatus] = useState<'rejected' | 'modified'>('rejected');
  const [timeModalNote, setTimeModalNote] = useState('');
  const [timeModalNewTime, setTimeModalNewTime] = useState('');

  // Métrés modal
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [meterModalMission, setMeterModalMission] = useState<Mission | null>(null);
  const [meterModalQty, setMeterModalQty] = useState('');
  const [meterModalUnit, setMeterModalUnit] = useState('m²');

  // Stock Replenish modal
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [replenishItem, setReplenishItem] = useState<any>(null);
  const [replenishQty, setReplenishQty] = useState('');
  const [replenishUnitPrice, setReplenishUnitPrice] = useState('');
  const [replenishMinThreshold, setReplenishMinThreshold] = useState('');

  // Drag and Drop Planning Modal
  const [draggedMission, setDraggedMission] = useState<Mission | null>(null);
  const [showDropPlanningModal, setShowDropPlanningModal] = useState(false);
  const [dropTargetEmployee, setDropTargetEmployee] = useState<Employee | null>(null);
  const [dropMission, setDropMission] = useState<Mission | null>(null);
  const [dropStartDate, setDropStartDate] = useState('');
  const [dropEndDate, setDropEndDate] = useState('');
  const [dropChefDeMissionId, setDropChefDeMissionId] = useState('');
  const [dropTeamEmployeeIds, setDropTeamEmployeeIds] = useState<string[]>([]);

  // Mission search filter
  const [missionSearchQuery, setMissionSearchQuery] = useState('');
  const [missionStatusFilter, setMissionStatusFilter] = useState('');

  // Dynamic stocks state
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [newStockItem, setNewStockItem] = useState({ name: '', unit: 'pcs', quantity: '', unitPrice: '' });
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
    estimatedUnit: 'm²',
    siteSupervisorId: '',
  });
  const [missionPhotoFiles, setMissionPhotoFiles] = useState<File[]>([]);
  const [photoInputKey, setPhotoInputKey] = useState(Date.now());

  // Dynamic Client Creation Modal state
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    code: '',
    name: '',
    address: '',
    zipCode: '',
    city: '',
    countryCode: '',
    email: '',
    phone: '',
  });

  const openCreateClientModal = () => {
    const nextCodeNum = clients.length + 1;
    const autoCode = `CL${String(nextCodeNum).padStart(5, '0')}`;
    setNewClientForm({
      code: autoCode,
      name: '',
      address: '',
      zipCode: '',
      city: '',
      countryCode: '',
      email: '',
      phone: '',
    });
    setShowCreateClientModal(true);
  };

  const handleCreateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth(API_BASE_URL + '/clients', {
        method: 'POST',
        body: JSON.stringify(newClientForm),
      });
      if (res.ok) {
        const createdClient = await res.json();
        setClients(prev => [...prev, createdClient]);
        setNewMission(prev => ({ ...prev, clientName: createdClient.name }));
        setShowCreateClientModal(false);
      }
    } catch (err) {
      console.error('Erreur lors de la création du client:', err);
    }
  };

  const [manualUploadMissionId, setManualUploadMissionId] = useState('');
  const [manualUploadCategory, setManualUploadCategory] = useState('avant');
  const [manualUploadFiles, setManualUploadFiles] = useState<File[]>([]);
  const [manualUploadKey, setManualUploadKey] = useState(Date.now());

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
    username: '',
    password: '',
    hourlyRate: '35',
    monthlySalary: '',
    paidLeaveBalance: '0',
    paidLeaveN: '30',
    paidLeaveN1: '0',
    hireDate: '',
    rttBalance: '0',
    phone: '',
    email: '',
    qualification: 'Chauffeur Poids Lourd',
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
    employeeIds: [] as string[],
    date: new Date().toISOString().split('T')[0],
    notes: '',
    truckId: '',
  });

  const [planningDateEntries, setPlanningDateEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !planningForm.date) return;
    const fetchEntriesForFormDate = async () => {
      try {
        const targetDate = new Date(planningForm.date);
        const { year, week } = getISOWeekAndYear(targetDate);
        const res = await fetchWithAuth(`${API_BASE_URL}/planning/week?year=${year}&week=${week}`);
        if (res.ok) {
          setPlanningDateEntries(await res.json());
        }
      } catch (err) {
        console.error('Error fetching planning entries for form date:', err);
      }
    };
    fetchEntriesForFormDate();
  }, [planningForm.date, weeklyPlanning, isAuthenticated]);

  // Auth helpers
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const currentToken = token || localStorage.getItem('token');
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
      ...(options.headers as Record<string, string> || {}),
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

  const getWeeksForMonth = (year: number, month: number) => {
    const weeks: { year: number; week: number }[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let current = new Date(firstDay);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    current.setDate(diff);

    while (current <= lastDay || weeks.length < 5) {
      const info = getISOWeekAndYear(current);
      if (!weeks.some(w => w.year === info.year && w.week === info.week)) {
        weeks.push(info);
      }
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  };

  const fetchPlanningForWeek = async (y: number, w: number) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/planning/week?year=${y}&week=${w}`);
      if (res.ok) {
        setWeeklyPlanning(await res.json());
      }
    } catch (err) {
      console.error('Error fetching weekly planning:', err);
    }
  };

  const fetchPlanningForMonth = async (y: number, m: number) => {
    try {
      const weeks = getWeeksForMonth(y, m);
      const results = await Promise.all(
        weeks.map(w =>
          fetchWithAuth(`${API_BASE_URL}/planning/week?year=${w.year}&week=${w.week}`)
            .then(res => (res.ok ? res.json() : []))
            .catch(() => [])
        )
      );
      const allEntries = results.flat();
      const uniqueEntries = allEntries.filter((item, index, self) =>
        self.findIndex(t => t.id === item.id) === index
      );
      setWeeklyPlanning(uniqueEntries);
    } catch (err) {
      console.error('Error fetching monthly planning:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (planningView === 'week') {
      fetchPlanningForWeek(planningYear, planningWeek);
    } else {
      fetchPlanningForMonth(selectedYear, selectedMonth);
    }
  }, [planningView, planningYear, planningWeek, selectedYear, selectedMonth, isAuthenticated]);

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
        auditRes,
        leavesRes,
        siteSupervisorsRes,
        timeclockRes
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
        fetchWithAuth(API_BASE_URL + '/leave-requests').catch(() => null),
        fetchWithAuth(API_BASE_URL + '/site-supervisors').catch(() => null),
        fetchWithAuth(API_BASE_URL + '/timeclock/all').catch(() => null),
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
      if (leavesRes && leavesRes.ok) {
        setLeaveRequests(await leavesRes.json());
      }
      if (siteSupervisorsRes && siteSupervisorsRes.ok) {
        setSiteSupervisors(await siteSupervisorsRes.json());
      }
      if (timeclockRes && timeclockRes.ok) {
        setTimeEntries(await timeclockRes.json());
      }
      
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
      const selectedClientObj = clients.find(c => c.name === newMission.clientName);
      const payload = {
        title: newMission.title,
        type: newMission.type,
        clientName: newMission.clientName,
        clientId: selectedClientObj?.id,
        worksiteAddress: newMission.worksiteAddress,
        description: newMission.description,
        scheduledDate: new Date(newMission.scheduledDate).toISOString(),
        estimatedPrice: Number(newMission.estimatedPrice),
        truckId: newMission.truckId || undefined,
        surfaceArea: Number(newMission.surfaceArea) || undefined,
        estimatedUnit: newMission.estimatedUnit || 'm²',
        siteSupervisorId: newMission.siteSupervisorId || undefined,
      };

      const res = await fetchWithAuth(API_BASE_URL + '/missions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdMission = await res.json();

        if (missionPhotoFiles && missionPhotoFiles.length > 0) {
          for (const file of missionPhotoFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'before');
            formData.append('notes', 'Pièce jointe du chantier');

            await fetchWithAuth(`${API_BASE_URL}/photos/mission/${createdMission.id}`, {
              method: 'POST',
              body: formData,
            });
          }
        }

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
          estimatedUnit: 'm²',
          siteSupervisorId: '',
        });
        setMissionPhotoFiles([]);
        setPhotoInputKey(Date.now());
        setActiveTab('missions');
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

  const handleRequestExplanation = async (missionId: string, currentText: string) => {
    const text = window.prompt("Saisissez votre demande d'explication pour ce rapport :", currentText);
    if (text === null) return;
    
    try {
      const payload = {
        notes: text.trim() ? `DEMANDE D'EXPLICATION: ${text.trim()}` : null
      };
      
      const res = await fetchWithAuth(`${API_BASE_URL}/missions/${missionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelExplanation = async (missionId: string) => {
    if (!window.confirm("Voulez-vous annuler la demande d'explication pour ce rapport ?")) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/missions/${missionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: null })
      });
      
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUploadMissionId) {
      alert("Veuillez sélectionner une mission.");
      return;
    }
    if (manualUploadFiles.length === 0) {
      alert("Veuillez sélectionner au moins un fichier.");
      return;
    }

    try {
      for (const file of manualUploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', manualUploadCategory);
        formData.append('notes', 'Pièce jointe ajoutée manuellement depuis le Backoffice');

        await fetchWithAuth(`${API_BASE_URL}/photos/mission/${manualUploadMissionId}`, {
          method: 'POST',
          body: formData,
        });
      }

      setManualUploadFiles([]);
      setManualUploadKey(Date.now());
      // Reload photos list
      const res = await fetchWithAuth(API_BASE_URL + '/photos');
      if (res.ok) {
        const data = await res.json();
        setPhotosList(data);
      }
      alert("Fichiers téléversés avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'upload.");
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
      const payload: any = {
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        badgeNumber: newEmployee.badgeNumber,
        username: newEmployee.username || undefined,
        hourlyRate: Number(newEmployee.hourlyRate) || 35,
        monthlySalary: newEmployee.monthlySalary ? Number(newEmployee.monthlySalary) : undefined,
        paidLeaveBalance: Number(newEmployee.paidLeaveBalance) || 0,
        rttBalance: Number(newEmployee.rttBalance) || 0,
        phone: newEmployee.phone,
        email: newEmployee.email,
        qualification: newEmployee.qualification,
      };

      if (newEmployee.password) {
        payload.password = newEmployee.password;
      }

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
          username: '',
          password: '',
          hourlyRate: '35',
          monthlySalary: '',
          paidLeaveBalance: '0',
          paidLeaveN: '30',
          paidLeaveN1: '0',
          hireDate: '',
          rttBalance: '0',
          phone: '',
          email: '',
          qualification: 'Chauffeur Poids Lourd',
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
        setNewStockItem({ name: '', unit: 'pcs', quantity: '', unitPrice: '' });
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

  // Conducteur de travaux handlers
  const handleCreateOrUpdateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: newSupervisor.firstName,
        lastName: newSupervisor.lastName,
        phone: newSupervisor.phone,
        email: newSupervisor.email,
        clientId: newSupervisor.clientId || undefined,
      };

      const url = editingSupervisorId 
        ? `${API_BASE_URL}/site-supervisors/${editingSupervisorId}`
        : `${API_BASE_URL}/site-supervisors`;
      const method = editingSupervisorId ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNewSupervisor({ firstName: '', lastName: '', phone: '', email: '', clientId: '' });
        setEditingSupervisorId(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSupervisor = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce conducteur de travaux ?')) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/site-supervisors/${id}`, { method: 'DELETE' });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Validation d'heures handlers
  const handleValidateTimeEntry = async (id: string, status: string, validationNote?: string, newTimestamp?: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/timeclock/${id}/validate`, {
        method: 'POST',
        body: JSON.stringify({
          status,
          validationNote,
          newTimestamp,
          validatedBy: user?.firstName || 'Admin',
        }),
      });
      if (res.ok) {
        setTimeModalOpen(false);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchValidateTimeEntries = async () => {
    if (!window.confirm('Voulez-vous vraiment valider tous les pointages affichés ?')) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/timeclock/validate-batch`, {
        method: 'POST',
        body: JSON.stringify({
          employeeId: timeFilterEmployee || undefined,
          startDate: timeFilterStartDate || undefined,
          endDate: timeFilterEndDate || undefined,
          validatedBy: user?.firstName || 'Admin',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.updated} pointages ont été validés.`);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportTimeCSV = () => {
    if (!timeEntries || timeEntries.length === 0) {
      alert('Aucune heure à exporter.');
      return;
    }
    const headers = ['ID', 'Employe', 'Type', 'Date_Et_Heure', 'Statut_Validation', 'Note_Motif'];
    const rows = timeEntries.map(entry => [
      entry.id,
      entry.employee ? `${entry.employee.firstName} ${entry.employee.lastName}` : 'Inconnu',
      entry.type,
      new Date(entry.timestamp).toLocaleString('fr-FR'),
      entry.validationStatus || 'pending',
      `"${(entry.validationNote || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `heures_employes_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTimeSheet = () => {
    window.print();
  };

  // Métrés correction handler
  const handleSaveMeterCorrection = async () => {
    if (!meterModalMission) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/missions/${meterModalMission.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          actualQuantity: Number(meterModalQty),
          actualUnit: meterModalUnit,
        }),
      });
      if (res.ok) {
        setShowMeterModal(false);
        setMeterModalMission(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stock Replenishment handler
  const handleSaveReplenishment = async () => {
    if (!replenishItem) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/stock-items/${replenishItem.id}/replenish`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: Number(replenishQty),
          unitPrice: Number(replenishUnitPrice),
        }),
      });
      if (res.ok) {
        if (replenishMinThreshold) {
          await fetchWithAuth(`${API_BASE_URL}/stock-items/${replenishItem.id}`, {
            method: 'PUT',
            body: JSON.stringify({ minThreshold: Number(replenishMinThreshold) }),
          });
        }
        setShowReplenishModal(false);
        setReplenishItem(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Annual Leave Rollover
  const handleAnnualLeaveRollover = async () => {
    if (!window.confirm('Voulez-vous effectuer la bascule annuelle des congés payés au 1er Avril ? (Le solde N passe en N-1, et N est recalculé avec ancienneté/prorata)')) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/employees/leave-rollover`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Bascule des congés effectuée pour ${data.updated} salariés !`);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Dragged Planning
  const handleSaveDropPlanning = async () => {
    if (!dropMission || !dropTargetEmployee || !dropStartDate) return;
    try {
      const start = new Date(dropStartDate);
      const end = dropEndDate ? new Date(dropEndDate) : start;
      
      const employeeIds = Array.from(new Set([dropTargetEmployee.id, ...(dropChefDeMissionId ? [dropChefDeMissionId] : []), ...dropTeamEmployeeIds]));

      const payload = {
        missionId: dropMission.id,
        chefDeMissionId: dropChefDeMissionId || dropTargetEmployee.id,
        employeeIds,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };

      const res = await fetchWithAuth(`${API_BASE_URL}/planning`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowDropPlanningModal(false);
        setDropMission(null);
        setDropTargetEmployee(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Weekly planning
  const handleAddToPlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetDate = new Date(planningForm.date);
      const { year, week } = getISOWeekAndYear(targetDate);
      
      const rawDay = targetDate.getDay();
      const dayOfWeek = rawDay === 0 ? 7 : rawDay;

      // Update mission truck assignment
      if (planningForm.missionId) {
        await fetchWithAuth(`${API_BASE_URL}/missions/${planningForm.missionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ truckId: planningForm.truckId || null }),
        });
      }

      const payload = {
        missionId: planningForm.missionId,
        employeeIds: planningForm.employeeIds,
        year,
        week,
        dayOfWeek,
        notes: planningForm.notes,
      };

      const res = await fetchWithAuth(API_BASE_URL + '/planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPlanningForm({
          missionId: '',
          employeeIds: [],
          date: new Date().toISOString().split('T')[0],
          notes: '',
          truckId: '',
        });
        if (planningView === 'week') {
          fetchPlanningForWeek(planningYear, planningWeek);
        } else {
          fetchPlanningForMonth(selectedYear, selectedMonth);
        }
        // Reload all data to keep missions updated
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
      if (planningView === 'week') {
        fetchPlanningForWeek(planningYear, planningWeek);
      } else {
        fetchPlanningForMonth(selectedYear, selectedMonth);
      }
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

          {/* TAB: CREER UN CHANTIER */}
          <div className={`nav-item ${activeTab === 'create_mission' ? 'active' : ''}`} onClick={() => setActiveTab('create_mission')}>
            <Plus size={18} />
            Créer un chantier
          </div>
          
          {/* TAB 2: LISTE DES CHANTIERS */}
          <div className={`nav-item ${activeTab === 'missions' ? 'active' : ''}`} onClick={() => setActiveTab('missions')}>
            <Briefcase size={18} />
            Liste des chantiers
          </div>

          {/* TAB: CONDUCTEURS DE TRAVAUX */}
          <div className={`nav-item ${activeTab === 'site_supervisors' ? 'active' : ''}`} onClick={() => setActiveTab('site_supervisors')}>
            <UserCheck size={18} />
            Conducteurs de travaux
          </div>

          {/* TAB: VALIDATION DES HEURES */}
          <div className={`nav-item ${activeTab === 'time_validation' ? 'active' : ''}`} onClick={() => setActiveTab('time_validation')}>
            <Clock size={18} />
            Validation des Heures
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

          {/* TAB 8 REMOVED */}

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

          {/* TAB 15: LEAVE REQUESTS */}
          <div className={`nav-item ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
            <Calendar size={18} />
            Demandes de Congés
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

            {/* ALERTS GRID: Métrés Ecarts & Seuils de Stock */}
            <div className="grid-2" style={{ marginBottom: '32px' }}>
              {/* Alertes Écarts de Métrés */}
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                  <AlertTriangle size={20} /> Alertes Écarts de Métrés (Chantiers)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                  {missions.filter(m => m.actualQuantity !== undefined && m.actualQuantity !== null && Number(m.actualQuantity) !== Number(m.surfaceArea)).map(m => {
                    const prev = Number(m.surfaceArea || 0);
                    const real = Number(m.actualQuantity);
                    const diff = real - prev;
                    const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : '0';
                    return (
                      <div key={m.id} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'rgba(245, 158, 11, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>{m.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Prévu: {prev} {m.estimatedUnit || 'm²'} | Réalisé: <strong style={{ color: diff > 0 ? '#ef4444' : '#10b981' }}>{real} {m.actualUnit || m.estimatedUnit || 'm²'} ({diff > 0 ? '+' : ''}{pct}%)</strong>
                          </div>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => { setMeterModalMission(m); setMeterModalQty(String(m.actualQuantity || '')); setMeterModalUnit(m.actualUnit || m.estimatedUnit || 'm²'); setShowMeterModal(true); }}>
                          Corriger
                        </button>
                      </div>
                    );
                  })}
                  {missions.filter(m => m.actualQuantity !== undefined && m.actualQuantity !== null && Number(m.actualQuantity) !== Number(m.surfaceArea)).length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                      Aucun écart de métré détecté sur les chantiers.
                    </div>
                  )}
                </div>
              </div>

              {/* Alertes Seuils de Stock */}
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                  <Package size={20} /> Alertes Stock du Dépôt (Seuil Minimum)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                  {stockItems.filter(item => Number(item.quantity || 0) <= Number(item.minThreshold || 10)).map(item => (
                    <div key={item.id} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'rgba(239, 68, 68, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          En Stock: <strong style={{ color: '#ef4444' }}>{item.quantity || 0} {item.unit}</strong> (Seuil min: {item.minThreshold || 10})
                        </div>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => { setReplenishItem(item); setReplenishQty(''); setReplenishUnitPrice(String(item.unitPrice || '')); setReplenishMinThreshold(String(item.minThreshold || 10)); setShowReplenishModal(true); }}>
                        Réapprovisionner
                      </button>
                    </div>
                  ))}
                  {stockItems.filter(item => Number(item.quantity || 0) <= Number(item.minThreshold || 10)).length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                      Tous les niveaux de stock du dépôt sont conformes.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Récapitulatif Heures Hebdo par Salarié */}
            <div className="glass-card" style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="var(--primary)" /> Récapitulatif Total Heures par Salarié (Cette Semaine)
              </h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Salarié</th>
                      <th>Qualification</th>
                      <th>Nombre de Pointages</th>
                      <th>Pointages Validés</th>
                      <th>En Attente / Refusés</th>
                      <th>Solde Congés N-1</th>
                      <th>Solde Congés N</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => {
                      const empEntries = timeEntries.filter(t => t.employee?.id === emp.id);
                      const validatedCount = empEntries.filter(t => t.validationStatus === 'validated').length;
                      const pendingCount = empEntries.filter(t => t.validationStatus === 'pending' || t.validationStatus === 'rejected').length;
                      return (
                        <tr key={emp.id}>
                          <td style={{ fontWeight: '700' }}>{emp.firstName} {emp.lastName}</td>
                          <td>{emp.qualification || 'Salarié'}</td>
                          <td>{empEntries.length}</td>
                          <td style={{ color: '#10b981', fontWeight: '600' }}>{validatedCount}</td>
                          <td style={{ color: pendingCount > 0 ? '#f59e0b' : 'var(--text-muted)' }}>{pendingCount}</td>
                          <td style={{ fontWeight: '600' }}>{emp.paidLeaveN1 ?? 0} j</td>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{emp.paidLeaveN ?? 30} j</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

        {/* TAB: CREER UN CHANTIER */}
        {activeTab === 'create_mission' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Créer un nouveau Chantier</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Renseignez toutes les informations de l'intervention et joignez les documents requis.</p>
            </div>

            <div className="glass-card" style={{ maxWidth: '800px' }}>
              <form onSubmit={handleCreateMission}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Titre du Chantier</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Sablage pont de la Cèze" 
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
                      <option value="DEPOT">Dépôt (Travail au dépôt)</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Client</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="form-input" 
                        style={{ flex: 1, marginBottom: 0 }}
                        value={newMission.clientName}
                        onChange={e => {
                          if (e.target.value === '__NEW_CLIENT__') {
                            openCreateClientModal();
                          } else {
                            setNewMission({ 
                              ...newMission, 
                              clientName: e.target.value,
                              siteSupervisorId: '' // reset when client changes
                            });
                          }
                        }}
                        required
                      >
                        <option value="">Sélectionner un client...</option>
                        <option value="__NEW_CLIENT__" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                          ➕ -- Ajouter un nouveau client --
                        </option>
                        {clients.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.code ? `[${c.code}] ` : ''}{c.name} {c.city ? `(${c.city})` : ''}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ whiteSpace: 'nowrap', padding: '0 14px' }}
                        onClick={openCreateClientModal}
                      >
                        ➕ Nouveau
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Conducteur de Travaux (du Client)</label>
                    <select 
                      className="form-input"
                      value={newMission.siteSupervisorId}
                      onChange={e => setNewMission({ ...newMission, siteSupervisorId: e.target.value })}
                    >
                      <option value="">Sélectionner un conducteur de travaux...</option>
                      {siteSupervisors
                        .filter(s => !newMission.clientName || s.client?.name === newMission.clientName)
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName} {s.phone ? `(${s.phone})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse du Chantier</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="12 Route de Valréas, 84600 Grillon" 
                    value={newMission.worksiteAddress}
                    onChange={e => setNewMission({ ...newMission, worksiteAddress: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-3">
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
                    <label className="form-label">Métré Prévu</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ flex: 1 }}
                        placeholder="150"
                        value={newMission.surfaceArea}
                        onChange={e => setNewMission({ ...newMission, surfaceArea: e.target.value })}
                        required
                      />
                      <select 
                        className="form-input"
                        style={{ width: '100px' }}
                        value={newMission.estimatedUnit}
                        onChange={e => setNewMission({ ...newMission, estimatedUnit: e.target.value })}
                      >
                        <option value="m²">m²</option>
                        <option value="ml">ml</option>
                        <option value="pièce">pièce</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prix Estimé (€ HT)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="4500"
                      value={newMission.estimatedPrice}
                      onChange={e => setNewMission({ ...newMission, estimatedPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Documents & Pièces Jointes (Plans, Consignes...)</label>
                  <input 
                    key={photoInputKey}
                    type="file" 
                    multiple
                    className="form-input" 
                    onChange={e => setMissionPhotoFiles(e.target.files ? Array.from(e.target.files) : [])}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Consignes particulières</label>
                  <textarea 
                    className="form-input" 
                    rows={4} 
                    placeholder="Inscrire toutes les consignes de sécurité et détails techniques..."
                    value={newMission.description}
                    onChange={e => setNewMission({ ...newMission, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('missions')}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Créer le Chantier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: LISTE DES CHANTIERS */}
        {activeTab === 'missions' && (
          <div>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Liste des Chantiers</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Recherche instantanée et suivi des métrés / conducteurs de travaux.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setActiveTab('create_mission')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Nouveau Chantier
              </button>
            </div>

            {/* Filter Bar */}
            <div className="glass-card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 12px' }}>
                <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                <input 
                  type="text"
                  placeholder="Rechercher par titre, client, conducteur de travaux..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', padding: '10px 0', width: '100%' }}
                  value={missionSearchQuery}
                  onChange={e => setMissionSearchQuery(e.target.value)}
                />
              </div>

              <select 
                className="form-input"
                style={{ width: '200px', marginBottom: 0 }}
                value={missionStatusFilter}
                onChange={e => setMissionStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="planned">Planifiée</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            {/* Missions List Table */}
            <div className="glass-card">
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Chantier / Type</th>
                      <th>Client</th>
                      <th>Conducteur de Travaux</th>
                      <th>Métré Prévu vs Réalisé</th>
                      <th>Coût Matériaux</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions
                      .filter(m => {
                        const q = missionSearchQuery.toLowerCase();
                        const matchQ = !q || m.title.toLowerCase().includes(q) || 
                          (m.clientName && m.clientName.toLowerCase().includes(q)) || 
                          (m.siteSupervisor && `${m.siteSupervisor.firstName} ${m.siteSupervisor.lastName}`.toLowerCase().includes(q));
                        const matchStatus = !missionStatusFilter || m.status === missionStatusFilter;
                        return matchQ && matchStatus;
                      })
                      .map(m => {
                        const supervisor = m.siteSupervisor;
                        const prevQty = m.surfaceArea || 0;
                        const realQty = m.actualQuantity;
                        const unit = m.actualUnit || m.estimatedUnit || 'm²';
                        const isDiff = realQty !== undefined && realQty !== null && Number(realQty) !== Number(prevQty);

                        return (
                          <tr key={m.id}>
                            <td>
                              <div style={{ fontWeight: '700' }}>{m.title}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.worksiteAddress}</div>
                              <span className="badge badge-info" style={{ marginTop: '4px' }}>{m.type || 'Sablage'}</span>
                            </td>

                            <td>
                              <div style={{ fontWeight: '600' }}>{m.clientName || m.client?.name || '--'}</div>
                            </td>

                            <td>
                              {supervisor ? (
                                <div>
                                  <div style={{ fontWeight: '600' }}>{supervisor.firstName} {supervisor.lastName}</div>
                                  {supervisor.phone && (
                                    <a 
                                      href={`tel:${supervisor.phone}`} 
                                      className="btn btn-secondary" 
                                      style={{ padding: '2px 8px', fontSize: '11px', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                                    >
                                      <Phone size={12} /> {supervisor.phone}
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Non assigné</span>
                              )}
                            </td>

                            <td>
                              <div style={{ fontSize: '13px' }}>
                                Prévu: {prevQty} {m.estimatedUnit || 'm²'}
                              </div>
                              {realQty !== undefined && realQty !== null ? (
                                <div style={{ fontSize: '13px', fontWeight: '700', color: isDiff ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  Réalisé: {realQty} {unit}
                                  {isDiff && <AlertTriangle size={14} color="#f59e0b" />}
                                </div>
                              ) : (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Non saisi</div>
                              )}
                            </td>

                            <td>
                              <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                {m.totalMaterialCost !== undefined ? `${Number(m.totalMaterialCost).toLocaleString('fr-FR')} €` : '0 €'}
                              </span>
                            </td>

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

                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  onClick={() => {
                                    setMeterModalMission(m);
                                    setMeterModalQty(String(m.actualQuantity || m.surfaceArea || ''));
                                    setMeterModalUnit(m.actualUnit || m.estimatedUnit || 'm²');
                                    setShowMeterModal(true);
                                  }}
                                >
                                  <Edit3 size={14} /> Métré
                                </button>
                                <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => handleDeleteMission(m.id)}>
                                  Supprimer
                                </button>
                              </div>
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

        {/* TAB: CONDUCTEURS DE TRAVAUX */}
        {activeTab === 'site_supervisors' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Conducteurs de Travaux</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Gestion des référents clients sur le terrain.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              {/* Form */}
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                  {editingSupervisorId ? 'Modifier Conducteur' : 'Ajouter un Conducteur de Travaux'}
                </h3>
                <form onSubmit={handleCreateOrUpdateSupervisor}>
                  <div className="form-group">
                    <label className="form-label">Client Associé</label>
                    <select 
                      className="form-input"
                      value={newSupervisor.clientId}
                      onChange={e => setNewSupervisor({ ...newSupervisor, clientId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un client...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Jean"
                      value={newSupervisor.firstName}
                      onChange={e => setNewSupervisor({ ...newSupervisor, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Dupont"
                      value={newSupervisor.lastName}
                      onChange={e => setNewSupervisor({ ...newSupervisor, lastName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Téléphone Direct</label>
                    <input 
                      type="tel"
                      className="form-input"
                      placeholder="06 12 34 56 78"
                      value={newSupervisor.phone}
                      onChange={e => setNewSupervisor({ ...newSupervisor, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email (Optionnel)</label>
                    <input 
                      type="email"
                      className="form-input"
                      placeholder="j.dupont@client.fr"
                      value={newSupervisor.email}
                      onChange={e => setNewSupervisor({ ...newSupervisor, email: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {editingSupervisorId && (
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setEditingSupervisorId(null); setNewSupervisor({ firstName: '', lastName: '', phone: '', email: '', clientId: '' }); }}>
                        Annuler
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingSupervisorId ? 'Enregistrer' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Table */}
              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Liste des Conducteurs de Travaux</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Nom & Prénom</th>
                        <th>Client</th>
                        <th>Téléphone</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siteSupervisors.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '700' }}>{s.firstName} {s.lastName}</td>
                          <td>{s.client?.name || '--'}</td>
                          <td>
                            {s.phone ? (
                              <a href={`tel:${s.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                                📞 {s.phone}
                              </a>
                            ) : '--'}
                          </td>
                          <td>{s.email || '--'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                onClick={() => {
                                  setEditingSupervisorId(s.id);
                                  setNewSupervisor({
                                    firstName: s.firstName,
                                    lastName: s.lastName,
                                    phone: s.phone || '',
                                    email: s.email || '',
                                    clientId: s.client?.id || '',
                                  });
                                }}
                              >
                                Modifier
                              </button>
                              <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleDeleteSupervisor(s.id)}>
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

        {/* TAB: VALIDATION DES HEURES */}
        {activeTab === 'time_validation' && (
          <div>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Validation des Heures des Salariés</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Validez, corrigez ou refusez les pointages avec explication pour l'application mobile.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={handleExportTimeCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={18} /> Export CSV
                </button>
                <button className="btn btn-secondary" onClick={handlePrintTimeSheet} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Printer size={18} /> Imprimer Fiche d'Heure
                </button>
                <button className="btn btn-primary" onClick={handleBatchValidateTimeEntries} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckSquare size={18} /> Tout Valider (Sélection)
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Filtrer par Salarié</label>
                <select className="form-input" style={{ marginBottom: 0 }} value={timeFilterEmployee} onChange={e => setTimeFilterEmployee(e.target.value)}>
                  <option value="">Tous les salariés</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div style={{ width: '180px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Date Début</label>
                <input type="date" className="form-input" style={{ marginBottom: 0 }} value={timeFilterStartDate} onChange={e => setTimeFilterStartDate(e.target.value)} />
              </div>

              <div style={{ width: '180px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Date Fin</label>
                <input type="date" className="form-input" style={{ marginBottom: 0 }} value={timeFilterEndDate} onChange={e => setTimeFilterEndDate(e.target.value)} />
              </div>

              <div style={{ width: '180px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Statut Validation</label>
                <select className="form-input" style={{ marginBottom: 0 }} value={timeFilterStatus} onChange={e => setTimeFilterStatus(e.target.value)}>
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="validated">Validé</option>
                  <option value="modified">Corrigé</option>
                  <option value="rejected">Refusé</option>
                </select>
              </div>
            </div>

            {/* Time Entries Table */}
            <div className="glass-card">
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Salarié</th>
                      <th>Type de Pointage</th>
                      <th>Horodatage</th>
                      <th>Statut Validation</th>
                      <th>Motif / Explication</th>
                      <th>Validé par</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeEntries
                      .filter(entry => {
                        const matchEmp = !timeFilterEmployee || entry.employee?.id === timeFilterEmployee;
                        const matchStatus = !timeFilterStatus || entry.validationStatus === timeFilterStatus;
                        const tDate = entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0,10) : '';
                        const matchStart = !timeFilterStartDate || tDate >= timeFilterStartDate;
                        const matchEnd = !timeFilterEndDate || tDate <= timeFilterEndDate;
                        return matchEmp && matchStatus && matchStart && matchEnd;
                      })
                      .map(entry => {
                        const status = entry.validationStatus || 'pending';
                        return (
                          <tr key={entry.id}>
                            <td style={{ fontWeight: '700' }}>
                              {entry.employee ? `${entry.employee.firstName} ${entry.employee.lastName}` : 'Inconnu'}
                            </td>

                            <td>
                              <span className={`badge ${entry.type === 'START' ? 'badge-success' : 'badge-info'}`}>
                                {entry.type === 'START' ? 'Prise de poste (Start)' : 'Fin de journée (End)'}
                              </span>
                            </td>

                            <td>{new Date(entry.timestamp).toLocaleString('fr-FR')}</td>

                            <td>
                              {status === 'validated' && <span className="badge badge-success">Validé</span>}
                              {status === 'pending' && <span className="badge badge-warning">En attente</span>}
                              {status === 'modified' && <span className="badge badge-info">Corrigé</span>}
                              {status === 'rejected' && <span className="badge badge-danger">Refusé</span>}
                            </td>

                            <td>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {entry.validationNote || '--'}
                              </span>
                            </td>

                            <td>{entry.validatedBy || '--'}</td>

                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                  className="btn btn-success" 
                                  style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#10b981', color: '#fff' }}
                                  onClick={() => handleValidateTimeEntry(entry.id, 'validated')}
                                >
                                  Valider
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  onClick={() => {
                                    setTimeModalEntry(entry);
                                    setTimeModalStatus('modified');
                                    setTimeModalNote(entry.validationNote || '');
                                    setTimeModalNewTime(new Date(entry.timestamp).toISOString().slice(0, 16));
                                    setTimeModalOpen(true);
                                  }}
                                >
                                  Corriger
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#ef4444', color: '#fff' }}
                                  onClick={() => {
                                    setTimeModalEntry(entry);
                                    setTimeModalStatus('rejected');
                                    setTimeModalNote(entry.validationNote || '');
                                    setTimeModalOpen(true);
                                  }}
                                >
                                  Refuser
                                </button>
                              </div>
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

        {/* TAB 3: WEEKLY PLANNING */}
        {activeTab === 'planning' && (() => {
          // Helper: Find driver assigned to a truck on a date
          const getDriverForTruckOnDate = (truckId: string, date: Date) => {
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const match = assignments.find(a => {
              if (a.truckId !== truckId) return false;
              const start = new Date(a.startDate);
              const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
              if (d < normalizedStart) return false;
              if (a.endDate) {
                const end = new Date(a.endDate);
                const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                if (d > normalizedEnd) return false;
              }
              return true;
            });
            return match ? match.employee : null;
          };

          // Helper: Check if a leave request falls on a date
          const isLeaveOnDate = (req: any, date: Date) => {
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            return d >= normalizedStart && d <= normalizedEnd;
          };

          // Helper: Get leave requests on a date
          const getLeavesForDate = (date: Date) => {
            if (!planningFilterShowLeaves) return [];
            return leaveRequests.filter(req => {
              if (req.status !== 'approved') return false;
              if (planningFilterEmployee && req.employeeId !== planningFilterEmployee) return false;
              return isLeaveOnDate(req, date);
            });
          };

          const getEmployeeStatusOnDate = (empId: string, dateStr: string) => {
            if (!dateStr) return { status: 'free', label: 'Libre' };
            const date = new Date(dateStr);
            
            // 1. Check if the employee has an approved leave request on this date
            const hasLeave = leaveRequests.some(req => {
              if (req.status !== 'approved') return false;
              if (req.employeeId !== empId && req.employee?.id !== empId) return false;
              return isLeaveOnDate(req, date);
            });

            if (hasLeave) {
              return { status: 'leave', label: 'Absent' };
            }

            // 2. Check if the employee is already assigned to a planning mission on this date
            const targetDate = new Date(dateStr);
            const { year, week } = getISOWeekAndYear(targetDate);
            const rawDay = targetDate.getDay();
            const targetDayOfWeek = rawDay === 0 ? 7 : rawDay;

            const hasAssignment = planningDateEntries.some(e => {
              if (e.year !== year || e.week !== week || e.dayOfWeek !== targetDayOfWeek) return false;
              return e.employees?.some((emp: any) => emp.id === empId);
            });

            if (hasAssignment) {
              return { status: 'busy', label: 'Assigné actuellement' };
            }

            return { status: 'free', label: 'Libre' };
          };

          const getDaysInMonthGrid = (year: number, month: number) => {
            const dates: Date[] = [];
            const firstDay = new Date(year, month, 1);
            let firstDayOfWeek = firstDay.getDay();
            if (firstDayOfWeek === 0) firstDayOfWeek = 7;
            
            const startOffset = 1 - firstDayOfWeek;
            const startDate = new Date(firstDay);
            startDate.setDate(firstDay.getDate() + startOffset);
            
            const current = new Date(startDate);
            for (let i = 0; i < 42; i++) {
              dates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
            return dates;
          };

          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Agenda & Planning</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Affectez les véhicules aux chantiers, visualisez le planning et suivez les congés.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={`btn ${planningView === 'week' ? 'btn-primary' : ''}`} 
                    style={{ backgroundColor: planningView === 'week' ? 'var(--primary)' : 'var(--bg-card)', color: '#fff', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}
                    onClick={() => setPlanningView('week')}
                  >
                    Semaine
                  </button>
                  <button 
                    className={`btn ${planningView === 'month' ? 'btn-primary' : ''}`}
                    style={{ backgroundColor: planningView === 'month' ? 'var(--primary)' : 'var(--bg-card)', color: '#fff', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}
                    onClick={() => setPlanningView('month')}
                  >
                    Mois
                  </button>
                </div>
              </div>

              {/* Navigation & Controls */}
              <div className="glass-card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                {planningView === 'week' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                      onClick={() => {
                        if (planningWeek === 1) {
                          setPlanningWeek(52);
                          setPlanningYear(planningYear - 1);
                        } else {
                          setPlanningWeek(planningWeek - 1);
                        }
                      }}
                    >
                      Précédent
                    </button>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                      Semaine {planningWeek} ({planningYear})
                    </span>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                      onClick={() => {
                        if (planningWeek === 52) {
                          setPlanningWeek(1);
                          setPlanningYear(planningYear + 1);
                        } else {
                          setPlanningWeek(planningWeek + 1);
                        }
                      }}
                    >
                      Suivant
                    </button>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                      onClick={() => {
                        const nowInfo = getISOWeekAndYear(new Date());
                        setPlanningWeek(nowInfo.week);
                        setPlanningYear(nowInfo.year);
                      }}
                    >
                      Aujourd'hui
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                      onClick={() => {
                        if (selectedMonth === 0) {
                          setSelectedMonth(11);
                          setSelectedYear(selectedYear - 1);
                        } else {
                          setSelectedMonth(selectedMonth - 1);
                        }
                      }}
                    >
                      Précédent
                    </button>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', textTransform: 'capitalize' }}>
                      {new Date(selectedYear, selectedMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                      onClick={() => {
                        if (selectedMonth === 11) {
                          setSelectedMonth(0);
                          setSelectedYear(selectedYear + 1);
                        } else {
                          setSelectedMonth(selectedMonth + 1);
                        }
                      }}
                    >
                      Suivant
                    </button>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                      onClick={() => {
                        setSelectedMonth(new Date().getMonth());
                        setSelectedYear(new Date().getFullYear());
                      }}
                    >
                      Ce mois
                    </button>
                  </div>
                )}

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select 
                    className="form-input" 
                    style={{ width: '180px', marginBottom: 0 }}
                    value={planningFilterMission} 
                    onChange={e => setPlanningFilterMission(e.target.value)}
                  >
                    <option value="">Tous les chantiers</option>
                    {missions.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>

                  <select 
                    className="form-input" 
                    style={{ width: '180px', marginBottom: 0 }}
                    value={planningFilterEmployee} 
                    onChange={e => setPlanningFilterEmployee(e.target.value)}
                  >
                    <option value="">Tous les salariés</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>
                    <input 
                      type="checkbox" 
                      checked={planningFilterShowLeaves} 
                      onChange={e => setPlanningFilterShowLeaves(e.target.checked)} 
                    />
                    Afficher les congés
                  </label>
                </div>
              </div>

              <div className="grid-3" style={{ marginBottom: '32px' }}>
                {/* Form to Add Entry */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Planifier une affectation</h3>
                  <form onSubmit={handleAddToPlanning}>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input 
                        type="date"
                        className="form-input"
                        value={planningForm.date}
                        onChange={e => setPlanningForm({ ...planningForm, date: e.target.value })}
                        required
                      />
                    </div>
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
                      <label className="form-label">Salariés assignés</label>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                        {employees.map(emp => {
                          const isChecked = planningForm.employeeIds?.includes(emp.id);
                          const statusInfo = getEmployeeStatusOnDate(emp.id, planningForm.date);
                          
                          let badgeStyle: React.CSSProperties = {
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: 'auto'
                          };
                          
                          if (statusInfo.status === 'busy') {
                            badgeStyle = { ...badgeStyle, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
                          } else if (statusInfo.status === 'leave') {
                            badgeStyle = { ...badgeStyle, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
                          } else {
                            badgeStyle = { ...badgeStyle, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
                          }

                          return (
                            <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', margin: '4px 0', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', backgroundColor: isChecked ? 'rgba(255,255,255,0.03)' : 'transparent', transition: 'background-color 0.2s' }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => {
                                  const updatedIds = isChecked 
                                    ? planningForm.employeeIds.filter(id => id !== emp.id)
                                    : [...(planningForm.employeeIds || []), emp.id];
                                  setPlanningForm({ ...planningForm, employeeIds: updatedIds });
                                }}
                              />
                              <span style={{ fontWeight: '500' }}>{emp.firstName} {emp.lastName}</span>
                              <span style={badgeStyle}>{statusInfo.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Véhicule / Camion (Optionnel)</label>
                      <select 
                        className="form-input" 
                        value={planningForm.truckId}
                        onChange={e => setPlanningForm({ ...planningForm, truckId: e.target.value })}
                      >
                        <option value="">Sélectionner un véhicule...</option>
                        {trucks.map(t => (
                          <option key={t.id} value={t.id}>{t.plateNumber} ({t.model})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notes de planning</label>
                      <textarea 
                        className="form-input" 
                        value={planningForm.notes} 
                        onChange={e => setPlanningForm({ ...planningForm, notes: e.target.value })}
                        placeholder="Ex: Apporter les EPI, grue nécessaire..."
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Enregistrer au planning
                    </button>
                  </form>
                </div>

                {/* Calendar Grid Display */}
                <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                  {planningView === 'week' ? (
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Semaine en cours</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: '700', marginBottom: '8px', color: 'var(--primary)', fontSize: '14px' }}>
                        <div>Lun</div>
                        <div>Mar</div>
                        <div>Mer</div>
                        <div>Jeu</div>
                        <div>Ven</div>
                        <div>Sam</div>
                        <div>Dim</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((dayName, idx) => {
                          const dayIdx = idx + 1;
                          
                          // Date calculation
                          const monday = getDateOfISOWeek(planningWeek, planningYear);
                          const dayDate = new Date(monday);
                          dayDate.setDate(monday.getDate() + (dayIdx - 1));
                          const dateStr = dayDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

                          // Filtered entries
                          const dayEntries = weeklyPlanning.filter(e => {
                            if (e.dayOfWeek !== dayIdx) return false;
                            if (planningFilterMission && e.mission?.id !== planningFilterMission) return false;
                            if (planningFilterEmployee) {
                              if (!e.employees?.some(emp => emp.id === planningFilterEmployee)) return false;
                            }
                            return true;
                          });

                          const dayLeaves = getLeavesForDate(dayDate);
                          const hasToday = dayDate.toDateString() === new Date().toDateString();

                          return (
                            <div 
                              key={dayIdx} 
                              style={{ 
                                minHeight: '150px', 
                                backgroundColor: 'rgba(255,255,255,0.02)', 
                                border: hasToday ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                                borderRadius: '4px', 
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: hasToday ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                  {dateStr}
                                </span>
                                <span 
                                  style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
                                  onClick={() => {
                                    const localISO = new Date(dayDate.getTime() - dayDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                                    setPlanningForm({ ...planningForm, employeeIds: [], date: localISO, missionId: '', truckId: '', notes: '' });
                                  }}
                                >
                                  +
                                </span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                                {/* Leaves display */}
                                {dayLeaves.map(req => {
                                  const emp = req.employee || employees.find((e: any) => e.id === req.employeeId);
                                  return (
                                    <div 
                                      key={`leave-${req.id}`} 
                                      style={{ 
                                        backgroundColor: 'rgba(245,158,11,0.08)', 
                                        borderLeft: '2px solid #f59e0b', 
                                        padding: '2px 4px', 
                                        borderRadius: '2px', 
                                        fontSize: '10px', 
                                        color: '#f59e0b'
                                      }}
                                    >
                                      🌴 {emp ? `${emp.firstName} ${emp.lastName.charAt(0)}.` : 'Salarié'} (Absent)
                                    </div>
                                  );
                                })}

                                {/* Regular planning entries */}
                                {dayEntries.map(e => (
                                  <div 
                                    key={e.id} 
                                    style={{ 
                                      backgroundColor: 'rgba(59,130,246,0.1)', 
                                      borderLeft: '2px solid var(--primary)', 
                                      padding: '2px 4px', 
                                      borderRadius: '2px', 
                                      fontSize: '10px', 
                                      color: '#fff',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                      <strong>{e.mission?.title}</strong> 
                                      {e.employees && e.employees.length > 0 && ` (${e.employees.map(emp => emp.lastName).join(', ')})`}
                                    </div>
                                    <span 
                                      style={{ cursor: 'pointer', color: 'var(--danger)', marginLeft: '4px', fontWeight: 'bold' }} 
                                      onClick={(evt) => {
                                        evt.stopPropagation();
                                        handleRemoveFromPlanning(e.id);
                                      }}
                                    >
                                      ×
                                    </span>
                                  </div>
                                ))}

                                {dayEntries.length === 0 && dayLeaves.length === 0 && (
                                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', textAlign: 'center', marginTop: '10px' }}>Vide</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Month Grid View */
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Grille mensuelle</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: '700', marginBottom: '8px', color: 'var(--primary)', fontSize: '14px' }}>
                        <div>Lun</div>
                        <div>Mar</div>
                        <div>Mer</div>
                        <div>Jeu</div>
                        <div>Ven</div>
                        <div>Sam</div>
                        <div>Dim</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {getDaysInMonthGrid(selectedYear, selectedMonth).map((cellDate, idx) => {
                          const isCurrentMonth = cellDate.getMonth() === selectedMonth;
                          const dateStr = cellDate.getDate();
                          
                          // Entries on this date
                          const cellEntries = weeklyPlanning.filter(e => {
                            const monday = getDateOfISOWeek(e.week, e.year);
                            const entryDate = new Date(monday);
                            entryDate.setDate(monday.getDate() + (e.dayOfWeek - 1));
                            const matchesDate = entryDate.getFullYear() === cellDate.getFullYear() &&
                                                entryDate.getMonth() === cellDate.getMonth() &&
                                                entryDate.getDate() === cellDate.getDate();
                            if (!matchesDate) return false;
                            
                            if (planningFilterMission && e.mission?.id !== planningFilterMission) return false;
                            if (planningFilterEmployee) {
                              if (!e.employees?.some(emp => emp.id === planningFilterEmployee)) return false;
                            }
                            return true;
                          });

                          const cellLeaves = getLeavesForDate(cellDate);
                          const hasToday = cellDate.toDateString() === new Date().toDateString();

                          return (
                            <div 
                              key={idx} 
                              style={{ 
                                minHeight: '90px', 
                                backgroundColor: isCurrentMonth ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.005)', 
                                border: hasToday ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                                borderRadius: '4px', 
                                padding: '4px', 
                                opacity: isCurrentMonth ? 1 : 0.4,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: hasToday ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                  {dateStr}
                                </span>
                                <span 
                                  style={{ fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}
                                  onClick={() => {
                                    const localISO = new Date(cellDate.getTime() - cellDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                                    setPlanningForm({ ...planningForm, employeeIds: [], date: localISO, missionId: '', truckId: '', notes: '' });
                                  }}
                                >
                                  +
                                </span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', flex: 1, overflowY: 'auto' }}>
                                {cellLeaves.map(req => {
                                  const emp = req.employee || employees.find((e: any) => e.id === req.employeeId);
                                  return (
                                    <div 
                                      key={req.id} 
                                      title={`🌴 Absent: ${emp ? emp.firstName + ' ' + emp.lastName : 'Salarié'}`}
                                      style={{ 
                                        backgroundColor: '#f59e0b', 
                                        color: '#000', 
                                        fontSize: '9px', 
                                        fontWeight: '600', 
                                        padding: '1px 3px', 
                                        borderRadius: '2px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      🌴 {emp ? emp.lastName : 'Absence'}
                                    </div>
                                  );
                                })}

                                {cellEntries.map(e => (
                                  <div 
                                    key={e.id} 
                                    title={`${e.mission?.title} ${e.truck ? '(' + e.truck.plateNumber + ')' : ''}`}
                                    style={{ 
                                      backgroundColor: 'var(--primary)', 
                                      color: '#fff', 
                                      fontSize: '9px', 
                                      fontWeight: '600', 
                                      padding: '1px 3px', 
                                      borderRadius: '2px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    🚛 {e.mission?.title.substring(0, 10)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

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

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Importer des pièces jointes</h3>
                <form onSubmit={handleManualUpload}>
                  <div className="form-group">
                    <label className="form-label">Mission / Chantier</label>
                    <select 
                      className="form-input" 
                      value={manualUploadMissionId}
                      onChange={e => setManualUploadMissionId(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner une mission...</option>
                      {missions.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Étape / Catégorie</label>
                    <select 
                      className="form-input" 
                      value={manualUploadCategory}
                      onChange={e => setManualUploadCategory(e.target.value)}
                      required
                    >
                      <option value="avant">Avant Chantier</option>
                      <option value="pendant">Pendant Chantier</option>
                      <option value="apres">Après Chantier</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fichiers (tous formats)</label>
                    <input 
                      key={manualUploadKey}
                      type="file" 
                      multiple
                      className="form-input" 
                      onChange={e => setManualUploadFiles(e.target.files ? Array.from(e.target.files) : [])}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Téléverser
                  </button>
                </form>
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Galerie Photos & Pièces Jointes</h3>
                <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {photosList.map((p: any) => {
                    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(p.url);
                    const fileUrl = p.url.startsWith('http') ? p.url : `${API_BASE_URL}${p.url}`;
                    return (
                      <div key={p.id} className="glass-card" style={{ padding: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {!isImage ? (
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              width: '100%', 
                              height: '160px', 
                              borderRadius: 'var(--radius-sm)', 
                              backgroundColor: 'rgba(255,255,255,0.05)', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '12px',
                              border: '1.5px dashed var(--border-color)',
                              textDecoration: 'none'
                            }}
                          >
                            <span style={{ fontSize: '40px' }}>📄</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center', padding: '0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                              {p.url.split('/').pop()}
                            </span>
                          </a>
                        ) : (
                          <img 
                            src={fileUrl} 
                            alt="Chantier" 
                            style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                          />
                        )}
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
                    );
                  })}
                  {photosList.length === 0 && (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 0' }}>
                      Aucune pièce jointe n'a encore été téléversée.
                    </div>
                  )}
                </div>
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
                  {/* Code PIN non requis */}
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

        {/* TAB 8 REMOVED */}

        {/* TAB 9: STOCKS (LOADING TRUCKS) */}
        {activeTab === 'stock' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Gestion des Stocks & Dépôt</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Stock principal du dépôt, seuils d'alerte, coût d'achat et transfert vers les camions.</p>
            </div>

            {/* Base Stock Table (Depot) */}
            <div className="glass-card" style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Stock Principal du Dépôt</h3>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Article / Consommable</th>
                      <th>Quantité au Dépôt</th>
                      <th>Unité</th>
                      <th>Prix d'Achat Unitaire (€ HT)</th>
                      <th>Seuil d'Alerte</th>
                      <th>Statut Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockItems.map(item => {
                      const qty = item.quantity || 0;
                      const threshold = item.minThreshold || 10;
                      const isLow = qty <= threshold;
                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: '700' }}>{item.name}</td>
                          <td style={{ fontSize: '16px', fontWeight: '800', color: isLow ? '#ef4444' : 'var(--text-main)' }}>
                            {qty}
                          </td>
                          <td>{item.unit}</td>
                          <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                            {item.unitPrice ? `${Number(item.unitPrice).toLocaleString('fr-FR')} €` : '--'}
                          </td>
                          <td>{threshold} {item.unit}</td>
                          <td>
                            {isLow ? (
                              <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={12} /> Stock Bas !
                              </span>
                            ) : (
                              <span className="badge badge-success">Stock OK</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                              onClick={() => {
                                setReplenishItem(item);
                                setReplenishQty('');
                                setReplenishUnitPrice(String(item.unitPrice || ''));
                                setReplenishMinThreshold(String(item.minThreshold || 10));
                                setShowReplenishModal(true);
                              }}
                            >
                              <Package size={14} /> Réapprovisionner
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {stockItems.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>
                          Aucun consommable enregistré au dépôt.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              {/* Form Create Stock Item */}
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Nouveau Consommable Dépôt</h3>
                <form onSubmit={handleCreateStockItem}>
                  <div className="form-group">
                    <label className="form-label">Nom de l'élément</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Carburant GMR, Sac de Sable" 
                      value={newStockItem.name}
                      onChange={e => setNewStockItem({ ...newStockItem, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unité de mesure</label>
                    <select 
                      className="form-input" 
                      value={newStockItem.unit}
                      onChange={e => setNewStockItem({ ...newStockItem, unit: e.target.value })}
                    >
                      <option value="litres">Litres</option>
                      <option value="sacs">Sacs</option>
                      <option value="pcs">Pièces (pcs)</option>
                      <option value="kg">Kilogrammes (kg)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantité Initiale</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="100" 
                      value={newStockItem.quantity}
                      onChange={e => setNewStockItem({ ...newStockItem, quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prix d'Achat Unitaire (€ HT)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="1.50" 
                      value={newStockItem.unitPrice}
                      onChange={e => setNewStockItem({ ...newStockItem, unitPrice: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Créer l'Article
                  </button>
                </form>
              </div>

              {/* Truck Stock Allocation */}
              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Transfert Dépôt vers Véhicule</h3>
                <form onSubmit={handleAssignStockToTruck} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Véhicule</label>
                    <select 
                      className="form-input" 
                      value={selectedTruckForStock} 
                      onChange={e => setSelectedTruckForStock(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un véhicule...</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>{t.plateNumber} - {t.model}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Consommable Dépôt</label>
                    <select 
                      className="form-input" 
                      value={stockItemToAssign} 
                      onChange={e => setStockItemToAssign(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un produit...</option>
                      {stockItems.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Stock Dépôt: {s.quantity || 0} {s.unit})</option>
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
                    Transferer
                  </button>
                </form>

                {selectedTruckForStock && (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Nom du Consommable</th>
                          <th>Quantité Embarquée</th>
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
                    <label className="form-label">Numéro de Badge (Optionnel)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. BDG-982" 
                      value={newEmployee.badgeNumber}
                      onChange={e => setNewEmployee({ ...newEmployee, badgeNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Identifiant (Nom d'utilisateur)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="jdupont" 
                      value={newEmployee.username}
                      onChange={e => setNewEmployee({ ...newEmployee, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mot de passe par défaut (Min 6 caractères)</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder={editingEmployeeId ? "(Inchangé si vide)" : "Par défaut: 123456"} 
                      value={newEmployee.password}
                      onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Salaire Mensuel (Optionnel)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 2500" 
                      value={newEmployee.monthlySalary}
                      onChange={e => setNewEmployee({ ...newEmployee, monthlySalary: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Solde Congés Payés (jours)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 25" 
                      value={newEmployee.paidLeaveBalance}
                      onChange={e => setNewEmployee({ ...newEmployee, paidLeaveBalance: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Solde RTT (jours)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 10" 
                      value={newEmployee.rttBalance}
                      onChange={e => setNewEmployee({ ...newEmployee, rttBalance: e.target.value })}
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
                      <button type="button" className="btn btn-secondary" onClick={() => { setEditingEmployeeId(null); setNewEmployee({ firstName: '', lastName: '', badgeNumber: '', username: '', password: '', hourlyRate: '35', monthlySalary: '', paidLeaveBalance: '0', paidLeaveN: '30', paidLeaveN1: '0', hireDate: '', rttBalance: '0', phone: '', email: '', qualification: 'Chauffeur Poids Lourd' }); }}>
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
                                    username: emp.username || '',
                                    password: '',
                                    hourlyRate: String(emp.hourlyRate || 35),
                                    monthlySalary: emp.monthlySalary ? String(emp.monthlySalary) : '',
                                    paidLeaveBalance: String(emp.paidLeaveBalance || 0),
                                    paidLeaveN: String(emp.paidLeaveN || 30),
                                    paidLeaveN1: String(emp.paidLeaveN1 || 0),
                                    hireDate: emp.hireDate ? new Date(emp.hireDate).toISOString().slice(0, 10) : '',
                                    rttBalance: String(emp.rttBalance || 0),
                                    phone: emp.phone || '',
                                    email: emp.email || '',
                                    qualification: emp.qualification || 'Chauffeur Poids Lourd',
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

        {/* TAB 15: LEAVE REQUESTS */}
        {activeTab === 'leaves' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Demandes de Congés & RTT</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Validez ou refusez les demandes d'absences soumises par les employés.</p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Demandes en attente de décision</h3>
              
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employé</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Durée calculée</th>
                      <th>Raison / Motif</th>
                      <th>Soldes actuels</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map(req => {
                      const emp = req.employee || employees.find((e: any) => e.id === req.employeeId);
                      const formattedStart = req.startDate ? req.startDate.split('T')[0] : '';
                      const formattedEnd = req.endDate ? req.endDate.split('T')[0] : '';
                      const dateDisplay = formattedStart === formattedEnd ? formattedStart : `Du ${formattedStart} au ${formattedEnd}`;
                      
                      let typeText = req.type;
                      if (req.type === 'conge') typeText = 'Congé Payé';
                      else if (req.type === 'rtt') typeText = 'RTT';
                      else if (req.type === 'sans_solde') typeText = 'Sans Solde';
                      else if (req.type === 'autre') typeText = 'Autre';

                      const handleAction = async (status: 'approved' | 'rejected') => {
                        try {
                          const res = await fetchWithAuth(`${API_BASE_URL}/leave-requests/${req.id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status })
                          });
                          if (!res.ok) {
                            const errData = await res.json();
                            alert(errData.message || 'Erreur lors de la mise à jour du statut.');
                            return;
                          }
                          alert(`Demande ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès.`);
                          loadAllData();
                        } catch (err) {
                          alert('Impossible de mettre à jour la demande.');
                        }
                      };

                      return (
                        <tr key={req.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{emp ? `${emp.firstName} ${emp.lastName}` : 'Inconnu'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>@{emp?.username}</div>
                          </td>
                          <td>{typeText}</td>
                          <td>
                            <div>{dateDisplay}</div>
                            {req.isHalfDay && <span style={{ fontSize: '11px', color: 'var(--primary)' }}>Demi-journée</span>}
                          </td>
                          <td style={{ fontWeight: '700' }}>{req.duration} jour(s)</td>
                          <td style={{ fontStyle: 'italic', fontSize: '13px' }}>{req.reason || '-'}</td>
                          <td>
                            <div style={{ fontSize: '12px' }}>Congés: <strong style={{ color: 'var(--primary)' }}>{emp?.paidLeaveBalance ?? 0}j</strong></div>
                            <div style={{ fontSize: '12px' }}>RTT: <strong style={{ color: 'var(--success)' }}>{emp?.rttBalance ?? 0}j</strong></div>
                          </td>
                          <td>
                            <span className={`badge badge-${req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}`}>
                              {req.status === 'approved' ? 'Approuvé' : req.status === 'rejected' ? 'Refusé' : 'En attente'}
                            </span>
                          </td>
                          <td>
                            {req.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="btn btn-success" 
                                  style={{ padding: '6px 12px', fontSize: '13px' }}
                                  onClick={() => handleAction('approved')}
                                >
                                  Accepter
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#dc2626' }}
                                  onClick={() => handleAction('rejected')}
                                >
                                  Refuser
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Traité</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {leaveRequests.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                          Aucune demande de congé enregistrée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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

        {/* MODAL CREATION CLIENT */}
        {showCreateClientModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '32px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>➕ Créer un nouveau client</h3>
                <button 
                  type="button" 
                  onClick={() => setShowCreateClientModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateClientSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Code Client</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newClientForm.code} 
                      onChange={e => setNewClientForm({ ...newClientForm, code: e.target.value })}
                      placeholder="CL00152"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom du Client *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newClientForm.name} 
                      onChange={e => setNewClientForm({ ...newClientForm, name: e.target.value })}
                      placeholder="e.g. SOLS PROVENCE"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse de facturation</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newClientForm.address} 
                    onChange={e => setNewClientForm({ ...newClientForm, address: e.target.value })}
                    placeholder="12 Rue des Artisans"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Code Postal</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newClientForm.zipCode} 
                      onChange={e => setNewClientForm({ ...newClientForm, zipCode: e.target.value })}
                      placeholder="84600"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newClientForm.city} 
                      onChange={e => setNewClientForm({ ...newClientForm, city: e.target.value })}
                      placeholder="GRILLON"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={newClientForm.email} 
                      onChange={e => setNewClientForm({ ...newClientForm, email: e.target.value })}
                      placeholder="contact@client.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newClientForm.phone} 
                      onChange={e => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                      placeholder="04 90 00 00 00"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowCreateClientModal(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Enregistrer & Sélectionner
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL VALIDATION / CORRECTION HEURES */}
        {timeModalOpen && timeModalEntry && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
                {timeModalStatus === 'rejected' ? 'Refuser le pointage' : 'Corriger le pointage'}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Salarié : <strong>{timeModalEntry.employee ? `${timeModalEntry.employee.firstName} ${timeModalEntry.employee.lastName}` : 'Inconnu'}</strong>
              </p>

              {timeModalStatus === 'modified' && (
                <div className="form-group">
                  <label className="form-label">Nouvel Horodatage</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={timeModalNewTime}
                    onChange={e => setTimeModalNewTime(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Message / Explication (Envoyé à l'application mobile)</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Ex: Merci d'ajuster votre heure d'arrivée car le départ camion était à 07h30..."
                  value={timeModalNote}
                  onChange={e => setTimeModalNote(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setTimeModalOpen(false)}>Annuler</button>
                <button 
                  type="button" 
                  className={`btn ${timeModalStatus === 'rejected' ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => handleValidateTimeEntry(timeModalEntry.id, timeModalStatus, timeModalNote, timeModalStatus === 'modified' ? new Date(timeModalNewTime).toISOString() : undefined)}
                >
                  {timeModalStatus === 'rejected' ? 'Confirmer le Refus' : 'Enregistrer la Correction'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CORRECTION DE METRE */}
        {showMeterModal && meterModalMission && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
                Saisir / Corriger le Métré Réalisé
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Chantier : <strong>{meterModalMission.title}</strong> (Prévu : {meterModalMission.surfaceArea || '--'} {meterModalMission.estimatedUnit || 'm²'})
              </p>

              <div className="form-group">
                <label className="form-label">Quantité Réalisée</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ flex: 1 }}
                    value={meterModalQty}
                    onChange={e => setMeterModalQty(e.target.value)}
                    required
                  />
                  <select 
                    className="form-input" 
                    style={{ width: '100px' }}
                    value={meterModalUnit}
                    onChange={e => setMeterModalUnit(e.target.value)}
                  >
                    <option value="m²">m²</option>
                    <option value="ml">ml</option>
                    <option value="pièce">pièce</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMeterModal(false)}>Annuler</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveMeterCorrection}>
                  Finaliser & Valider Métré
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL REAPPROVISIONNEMENT STOCK */}
        {showReplenishModal && replenishItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
                Réapprovisionner le Stock (Dépôt)
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Article : <strong>{replenishItem.name}</strong> (Actuel : {replenishItem.quantity || 0} {replenishItem.unit})
              </p>

              <div className="form-group">
                <label className="form-label">Quantité Ajoutée</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="50"
                  value={replenishQty}
                  onChange={e => setReplenishQty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prix d'Achat Payé Unitaire (€ HT)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="12.50"
                  value={replenishUnitPrice}
                  onChange={e => setReplenishUnitPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Seuil Minimum d'Alerte</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="10"
                  value={replenishMinThreshold}
                  onChange={e => setReplenishMinThreshold(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReplenishModal(false)}>Annuler</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveReplenishment}>
                  Confirmer le Réapprovisionnement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DRAG AND DROP PLANNING */}
        {showDropPlanningModal && dropTargetEmployee && dropMission && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
                Assigner le Chantier via Planning
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Chantier : <strong>{dropMission.title}</strong>
              </p>

              <div className="form-group">
                <label className="form-label">Chef de Chantier (Déclaré pour les métrés)</label>
                <select 
                  className="form-input"
                  value={dropChefDeMissionId}
                  onChange={e => setDropChefDeMissionId(e.target.value)}
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.qualification || 'Salarié'})</option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Date Début</label>
                  <input type="date" className="form-input" value={dropStartDate} onChange={e => setDropStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date Fin</label>
                  <input type="date" className="form-input" value={dropEndDate} onChange={e => setDropEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Membres de l'équipe (Co-assignés)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  {employees.map(emp => (
                    <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={dropTeamEmployeeIds.includes(emp.id) || dropChefDeMissionId === emp.id}
                        disabled={dropChefDeMissionId === emp.id}
                        onChange={e => {
                          if (e.target.checked) {
                            setDropTeamEmployeeIds(prev => [...prev, emp.id]);
                          } else {
                            setDropTeamEmployeeIds(prev => prev.filter(id => id !== emp.id));
                          }
                        }}
                      />
                      {emp.firstName} {emp.lastName} {dropChefDeMissionId === emp.id ? '(Chef de chantier)' : ''}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDropPlanningModal(false)}>Annuler</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveDropPlanning}>
                  Enregistrer l'assignation
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
