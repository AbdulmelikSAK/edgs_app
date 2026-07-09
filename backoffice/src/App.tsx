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
  LogOut
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
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
}

interface Mission {
  id: string;
  title: string;
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'planning' | 'trucks' | 'stock' | 'reports'>('dashboard');
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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

  // Form states
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    estimatedPrice: '',
    truckId: '',
    clientId: '',
    worksiteId: '',
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
  };

  // Load all data from API
  const loadAllData = async () => {
    if (!isAuthenticated) return;
    try {
      const { year, week } = getISOWeekAndYear(new Date());

      const [missionsRes, trucksRes, clientsRes, worksitesRes, statsRes, planningRes, reportsRes] = await Promise.all([
        fetchWithAuth(API_BASE_URL + '/missions'),
        fetchWithAuth(API_BASE_URL + '/trucks'),
        fetchWithAuth(API_BASE_URL + '/clients'),
        fetchWithAuth(API_BASE_URL + '/worksites'),
        fetchWithAuth(API_BASE_URL + '/stats'),
        fetchWithAuth(`${API_BASE_URL}/planning/week?year=${year}&week=${week}`),
        fetchWithAuth(API_BASE_URL + '/reports'),
      ]);

      const [missionsData, trucksData, clientsData, worksitesData, statsData, planningData, reportsData] = await Promise.all([
        missionsRes.json(),
        trucksRes.json(),
        clientsRes.json(),
        worksitesRes.json(),
        statsRes.json(),
        planningRes.json(),
        reportsRes.json(),
      ]);

      setMissions(missionsData);
      setTrucks(trucksData);
      setClients(clientsData);
      setWorksites(worksitesData);
      setStats(statsData);
      setWeeklyPlanning(planningData);
      setReports(reportsData);

      // Fetch stock movements for first truck if available
      if (trucksData.length > 0) {
        const movementsRes = await fetchWithAuth(`${API_BASE_URL}/stock/truck/${trucksData[0].id}`);
        const movementsData = await movementsRes.json();
        setStockMovements(movementsData);
      }
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
    if (activeTab === 'dashboard' && isAuthenticated) {
      fetchWithAuth(API_BASE_URL + '/gps/live')
        .then(res => res.json())
        .then(data => setLivePositions(data))
        .catch(err => console.error('Erreur live positions:', err));
    }
  }, [activeTab, isAuthenticated]);

  // Load Leaflet Map for live tracking in Dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const mapContainer = document.getElementById('map');
      if (mapContainer && (window as any).L) {
        const container = (window as any).L.DomUtil.get('map');
        if (container) {
          container._leaflet_id = null;
        }

        const map = (window as any).L.map('map').setView([44.3958, 4.9285], 9);
        
        (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add worksites
        worksites.forEach(w => {
          const circle = (window as any).L.circle([w.latitude, w.longitude], {
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            radius: 800
          }).addTo(map);
          circle.bindPopup(`<b>Chantier: ${w.name}</b><br/>${w.address}`);
        });

        // Add truck markers
        livePositions.forEach(pos => {
          const marker = (window as any).L.marker([pos.latitude, pos.longitude]).addTo(map);
          marker.bindPopup(`<b>${pos.plateNumber}</b><br/>Vitesse: ${pos.speed || 0} km/h<br/>Dernière synchro: ${new Date(pos.lastSeen).toLocaleTimeString('fr-FR')}`).openPopup();
        });
      }
    }
  }, [activeTab, livePositions, worksites]);

  // Calculations
  const completedCount = stats?.missions?.completed || 0;
  const totalRevenue = stats?.financial?.totalRevenue || 0;
  const totalSandBagsUsed = stats?.operational?.totalSandBagsUsed || 0;
  const totalSurfaceArea = stats?.operational?.totalSurfaceArea || 0;

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMission.title || !newMission.scheduledDate) return;

    try {
      const res = await fetchWithAuth(API_BASE_URL + '/missions', {
        method: 'POST',
        body: JSON.stringify({
          title: newMission.title,
          description: newMission.description || undefined,
          scheduledDate: newMission.scheduledDate,
          estimatedPrice: Number(newMission.estimatedPrice) || undefined,
          truckId: newMission.truckId || undefined,
          clientId: newMission.clientId || undefined,
          worksiteId: newMission.worksiteId || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur de création de mission');
      }

      setNewMission({
        title: '',
        description: '',
        scheduledDate: '',
        estimatedPrice: '',
        truckId: '',
        clientId: '',
        worksiteId: '',
      });
      loadAllData();
      setActiveTab('missions');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création de la mission');
    }
  };

  const handleCreatePlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planningForm.missionId || !planningForm.truckId) return;

    try {
      const { year, week } = getISOWeekAndYear(new Date());
      const res = await fetchWithAuth(API_BASE_URL + '/planning', {
        method: 'POST',
        body: JSON.stringify({
          year,
          week,
          dayOfWeek: Number(planningForm.dayOfWeek),
          missionId: planningForm.missionId,
          truckId: planningForm.truckId,
          notes: planningForm.notes || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur planification');
      }

      setPlanningForm({
        missionId: '',
        truckId: '',
        dayOfWeek: '1',
        notes: '',
      });
      loadAllData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la programmation de la planification.');
    }
  };

  const handleDeletePlanning = async (id: string) => {
    if (!confirm('Voulez-vous retirer cette mission du calendrier hebdomadaire ?')) return;
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/planning/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur de suppression');
      loadAllData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    }
  };

  const updateTruckStock = async (truckId: string, quantity: number) => {
    try {
      const type = quantity > 0 ? 'load' : 'consume';
      const res = await fetchWithAuth(API_BASE_URL + '/stock/movement', {
        method: 'POST',
        body: JSON.stringify({
          truckId,
          type,
          quantity: Math.abs(quantity),
          notes: 'Ajustement manuel depuis le backoffice',
        }),
      });

      if (!res.ok) throw new Error('Erreur stock');
      loadAllData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du stock.');
    }
  };

  const handleGenerateReport = async (missionId: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/reports/generate/${missionId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Erreur génération rapport');
      alert('Rapport généré avec succès !');
      loadAllData();
    } catch (err) {
      console.error(err);
      alert('Erreur de génération de rapport.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px', marginBottom: '8px' }}>
              EDGS Backoffice
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
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">EDGS Admin</div>
        </div>
        
        <nav className="nav-menu">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            Tableau de Bord
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'missions' ? 'active' : ''}`}
            onClick={() => setActiveTab('missions')}
          >
            <Briefcase size={20} />
            Missions
          </div>

          <div 
            className={`nav-item ${activeTab === 'planning' ? 'active' : ''}`}
            onClick={() => setActiveTab('planning')}
          >
            <Calendar size={20} />
            Planning Hebdo
          </div>

          <div 
            className={`nav-item ${activeTab === 'trucks' ? 'active' : ''}`}
            onClick={() => setActiveTab('trucks')}
          >
            <TruckIcon size={20} />
            Camions & Véhicules
          </div>

          <div 
            className={`nav-item ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            <Package size={20} />
            Gestion Stock
          </div>

          <div 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={20} />
            Rapports
          </div>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              EDGS API Connectée
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              Utilisateur: {user?.firstName}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', gap: '8px' }}>
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Vue d'ensemble</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Statistiques de sablage et suivi de la flotte en temps réel.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setActiveTab('missions')}>
                <Plus size={18} /> Nouvelle Mission
              </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>Revenus Réels</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: '#10b981' }}>{totalRevenue} €</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--success-glow)', padding: '10px', borderRadius: '8px', color: '#10b981' }}>
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Total des missions complétées
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>Sacs de Sable Consommés</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: '#f59e0b' }}>{totalSandBagsUsed} sacs</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--warning-glow)', padding: '10px', borderRadius: '8px', color: '#f59e0b' }}>
                    <Package size={24} />
                  </div>
                </div>
                <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Poids approx : {(totalSandBagsUsed * 25) / 1000} tonnes
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>Surface Traitée</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: '#3b82f6' }}>{totalSurfaceArea} m²</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--primary-glow)', padding: '10px', borderRadius: '8px', color: '#3b82f6' }}>
                    <Briefcase size={24} />
                  </div>
                </div>
                <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Rendement moyen : {(totalSurfaceArea / (totalSandBagsUsed || 1)).toFixed(1)} m²/sac
                </div>
              </div>
            </div>

            {/* Alert for low stock */}
            {trucks.some(t => t.currentStock <= t.stockAlertThreshold) && (
              <div className="glass-card" style={{ borderColor: 'var(--warning)', backgroundColor: 'var(--warning-glow)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <AlertTriangle size={24} color="var(--warning)" />
                <div>
                  <h4 style={{ color: 'var(--warning)', fontWeight: '700' }}>Alerte Stock Bas</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>
                    Certains camions possèdent un stock de sable inférieur au seuil critique : {
                      trucks.filter(t => t.currentStock <= t.stockAlertThreshold).map(t => `${t.plateNumber} (${t.currentStock} sacs)`).join(', ')
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Map and Side Stats */}
            <div className="grid-3">
              <div className="glass-card" style={{ gridColumn: 'span 2', padding: '0px', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Positions en Temps Réel</h3>
                  <span className="badge badge-info">Cartographie Live active</span>
                </div>
                <div id="map"></div>
              </div>

              {/* Today Planning list */}
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Activités de la semaine</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {missions.slice(0, 5).map(m => (
                    <div key={m.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: m.status === 'completed' ? 'var(--success-glow)' : 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={20} color={m.status === 'completed' ? 'var(--success)' : 'var(--primary)'} />
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{m.title}</h4>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Chantier : {m.worksite?.name || 'Non défini'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <span className={`badge ${m.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                            {m.status}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {new Date(m.scheduledDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {missions.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Aucune mission programmée.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MISSIONS (Create & List) */}
        {activeTab === 'missions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Missions</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Créez et assignez les ordres de mission.</p>
              </div>
            </div>

            <div className="grid-3">
              {/* Form creation */}
              <div className="glass-card" style={{ height: 'fit-content' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Créer une Mission</h3>
                <form onSubmit={handleCreateMission}>
                  <div className="form-group">
                    <label className="form-label">Titre</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Sablage façade Nord" 
                      value={newMission.title}
                      onChange={e => setNewMission({ ...newMission, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-input" 
                      rows={3} 
                      placeholder="Instructions particulières..."
                      value={newMission.description}
                      onChange={e => setNewMission({ ...newMission, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date & Heure programmée</label>
                    <input 
                      type="datetime-local" 
                      className="form-input" 
                      value={newMission.scheduledDate}
                      onChange={e => setNewMission({ ...newMission, scheduledDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prix Estimé (€)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 1500"
                      value={newMission.estimatedPrice}
                      onChange={e => setNewMission({ ...newMission, estimatedPrice: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Camion / Véhicule</label>
                    <select 
                      className="form-input"
                      value={newMission.truckId}
                      onChange={e => setNewMission({ ...newMission, truckId: e.target.value })}
                    >
                      <option value="">Sélectionner un camion</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>{t.plateNumber} - {t.model}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Client</label>
                    <select 
                      className="form-input"
                      value={newMission.clientId}
                      onChange={e => setNewMission({ ...newMission, clientId: e.target.value })}
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chantier / Adresse</label>
                    <select 
                      className="form-input"
                      value={newMission.worksiteId}
                      onChange={e => setNewMission({ ...newMission, worksiteId: e.target.value })}
                    >
                      <option value="">Sélectionner un chantier</option>
                      {worksites.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Créer et Planifier
                  </button>
                </form>
              </div>

              {/* Missions list */}
              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Liste des Missions</h3>
                
                <div className="table-container">
                  <table className="custom-table">
                     <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Client / Chantier</th>
                        <th>Camion</th>
                        <th>Date programmée</th>
                        <th>Statut</th>
                        <th>Prix Estimé</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missions.map(m => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: '600' }}>{m.title}</td>
                          <td>
                            <div>{m.client?.name || 'Sans Client'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{m.worksite?.name || 'Sans Chantier'}</div>
                          </td>
                          <td>{m.truck?.plateNumber || '--'}</td>
                          <td>{new Date(m.scheduledDate).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <span className={`badge ${m.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                              {m.status}
                            </span>
                          </td>
                          <td>{m.estimatedPrice || 0} €</td>
                        </tr>
                      ))}
                      {missions.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune mission trouvée.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLANNING */}
        {activeTab === 'planning' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Planning Hebdomadaire</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Calendrier de répartition des missions par camion pour la semaine en cours.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card" style={{ height: 'fit-content' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Planifier une mission</h3>
                <form onSubmit={handleCreatePlanning}>
                  <div className="form-group">
                    <label className="form-label">Mission</label>
                    <select 
                      className="form-input"
                      value={planningForm.missionId}
                      onChange={e => setPlanningForm({ ...planningForm, missionId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner une mission</option>
                      {missions.filter(m => m.status === 'planned').map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Camion</label>
                    <select 
                      className="form-input"
                      value={planningForm.truckId}
                      onChange={e => setPlanningForm({ ...planningForm, truckId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un camion</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>{t.plateNumber} - {t.model}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jour de la semaine</label>
                    <select 
                      className="form-input"
                      value={planningForm.dayOfWeek}
                      onChange={e => setPlanningForm({ ...planningForm, dayOfWeek: e.target.value })}
                      required
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
                    <label className="form-label">Notes (Optionnel)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Matinée seulement" 
                      value={planningForm.notes}
                      onChange={e => setPlanningForm({ ...planningForm, notes: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Ajouter au planning
                  </button>
                </form>
              </div>

              <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(5, 1fr)', gap: '12px' }}>
                  {/* Headers */}
                  <div style={{ fontWeight: '700', color: 'var(--text-secondary)', padding: '12px 4px' }}>Véhicule</div>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day, idx) => (
                    <div key={day} style={{ fontWeight: '700', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', textAlign: 'center' }}>
                      {day}
                    </div>
                  ))}

                  {/* Rows by truck */}
                  {trucks.map(t => (
                    <React.Fragment key={t.id}>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', padding: '12px 4px', borderRight: '1px solid var(--border-color)', fontSize: '13px' }}>
                        {t.plateNumber}
                      </div>
                      
                      {[1, 2, 3, 4, 5].map(dayIdx => {
                        const matchedPlan = weeklyPlanning.find(p => p.truck?.id === t.id && p.dayOfWeek === dayIdx);
                        const matchedMission = matchedPlan?.mission;
                        return (
                          <div key={dayIdx} style={{ minHeight: '120px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '4px' }}>
                            {matchedPlan && matchedMission ? (
                              <div className="glass-card" style={{ padding: '8px', fontSize: '11px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '3px solid var(--primary)', position: 'relative' }}>
                                <button 
                                  onClick={() => handleDeletePlanning(matchedPlan.id)} 
                                  style={{ position: 'absolute', top: '4px', right: '4px', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  ×
                                </button>
                                <div>
                                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }}>{matchedMission.title}</div>
                                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{matchedMission.client?.name || 'Client'}</div>
                                </div>
                                <span className={`badge ${matchedMission.status === 'completed' ? 'badge-success' : 'badge-info'}`} style={{ marginTop: '4px', alignSelf: 'flex-start', fontSize: '9px', padding: '2px 6px' }}>
                                  {matchedMission.status}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRUCKS */}
        {activeTab === 'trucks' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Camions & Véhicules</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Parc automobile, stock embarqué de sable et alertes.</p>
            </div>

            <div className="glass-card">
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Plaque d'Immatriculation</th>
                      <th>Modèle</th>
                      <th>Année</th>
                      <th>Stock Actuel</th>
                      <th>Seuil Critique</th>
                      <th>Statut Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map(t => {
                      const isCritical = t.currentStock <= t.stockAlertThreshold;
                      return (
                        <tr key={t.id}>
                          <td style={{ fontWeight: '600' }}>{t.plateNumber}</td>
                          <td>{t.model}</td>
                          <td>{t.year}</td>
                          <td style={{ fontSize: '18px', fontWeight: '700' }}>{t.currentStock} sacs</td>
                          <td>{t.stockAlertThreshold} sacs</td>
                          <td>
                            {isCritical ? (
                              <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={14} /> Stock Critique
                              </span>
                            ) : (
                              <span className="badge badge-success">Stock OK</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => updateTruckStock(t.id, 10)}>
                                +10 sacs
                              </button>
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => updateTruckStock(t.id, -5)}>
                                Consommer 5
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {trucks.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun camion trouvé.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STOCK */}
        {activeTab === 'stock' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Gestion des Stocks</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Historique des mouvements de sacs de sable.</p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Mouvements Récents (Premier Camion)</h3>
              
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Horodatage</th>
                      <th>Type de Mouvement</th>
                      <th>Quantité</th>
                      <th>Stock Avant</th>
                      <th>Stock Après</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.map(m => (
                      <tr key={m.id}>
                        <td>{new Date(m.createdAt).toLocaleString('fr-FR')}</td>
                        <td>
                          <span className={`badge ${m.type === 'load' ? 'badge-success' : 'badge-danger'}`}>
                            {m.type === 'load' ? 'Chargement' : 'Consommation'}
                          </span>
                        </td>
                        <td style={{ fontWeight: '700' }}>
                          {m.type === 'load' ? `+${m.quantity}` : `-${m.quantity}`} sacs
                        </td>
                        <td>{m.stockBefore} sacs</td>
                        <td>{m.stockAfter} sacs</td>
                        <td>{m.notes || '--'}</td>
                      </tr>
                    ))}
                    {stockMovements.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun mouvement enregistré pour ce véhicule.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>Rapports d'Intervention</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Générez et téléchargez les rapports complets d'intervention de sablage.</p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Rapports Disponibles</h3>
              
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Mission</th>
                      <th>Client</th>
                      <th>Date de Génération</th>
                      <th>Statut</th>
                      <th>Rapport</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.filter(m => m.status === 'completed').map(m => {
                      const report = reports.find(r => r.mission?.id === m.id);
                      return (
                        <tr key={m.id}>
                          <td style={{ fontWeight: '600' }}>{m.title}</td>
                          <td>{m.client?.name || 'Sans Client'}</td>
                          <td>{report ? new Date(report.createdAt).toLocaleDateString('fr-FR') : '--'}</td>
                          <td>
                            {report ? (
                              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={14} /> Prêt
                              </span>
                            ) : (
                              <span className="badge badge-warning">Non généré</span>
                            )}
                          </td>
                          <td>
                            {report ? (
                              <a 
                                href={report.url} 
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary" 
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '13px' }}
                              >
                                <Download size={14} /> Ouvrir le Rapport
                              </a>
                            ) : (
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '8px 14px', fontSize: '13px' }}
                                onClick={() => handleGenerateReport(m.id)}
                              >
                                Générer Rapport
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {missions.filter(m => m.status !== 'completed').map(m => (
                      <tr key={m.id} style={{ opacity: 0.6 }}>
                        <td style={{ fontWeight: '600' }}>{m.title}</td>
                        <td>{m.client?.name || '--'}</td>
                        <td>--</td>
                        <td>
                          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={14} /> En cours / Planifié
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-secondary" disabled style={{ opacity: 0.5 }}>
                            Non disponible
                          </button>
                        </td>
                      </tr>
                    ))}
                    {missions.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune mission trouvée.</td>
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
