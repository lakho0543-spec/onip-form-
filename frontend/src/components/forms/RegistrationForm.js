import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import './RegistrationForm.css';

const RegistrationForm = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrData, setQrData] = useState('');
  
  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Administrative data from GeoJSON
  const [adminData, setAdminData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [territoriesCache, setTerritoriesCache] = useState({});
  const [sectorsCache, setSectorsCache] = useState({});
  const [groupementsCache, setGroupementsCache] = useState({});
  const [villagesCache, setVillagesCache] = useState({});

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Relationship types for Tutor dropdown
  const relationshipTypes = [
    'Oncle',
    'Tante',
    'Parrain',
    'Grand-père',
    'Grand-mère',
    'Frère',
    'Sœur',
    'Cousin',
    'Cousine',
    'Autre'
  ];

  // Initial form data state
  const getInitialFormData = () => ({
    identification_country: 'RDC',
    identification_province: '',
    identification_territory: '',
    identification_sector: '',
    identification_groupement: '',
    identification_village: '',
    identification_bureau: '',
    category: '',
    first_name: '',
    last_name: '',
    postnom: '',
    nationality: 'Congolaise',
    birth_place: '',
    birth_date: '',
    gender: '',
    height_cm: '',
    eye_color: '',
    blood_type: '',
    rhesus: '',
    phone1: '',
    phone2: '',
    email: '',
    bp: '',
    origin_country: 'RDC',
    origin_province: '',
    origin_territory: '',
    origin_sector: '',
    origin_groupement: '',
    origin_village: '',
    residence_country: 'RDC',
    residence_province: '',
    residence_territory: '',
    residence_sector: '',
    residence_groupement: '',
    residence_village: '',
    residence_address: '',
    domicile_country: 'RDC',
    domicile_province: '',
    domicile_territory: '',
    domicile_sector: '',
    domicile_groupement: '',
    domicile_village: '',
    domicile_address: '',
    marital_status: 'celibataire',
    children_count: 0,
    children: [],
    spouse_first_name: '',
    spouse_last_name: '',
    spouse_postnom: '',
    spouse_nationality: '',
    spouse_birth_place: '',
    spouse_birth_date: '',
    spouse_gender: '',
    spouse_nin: '',
    father_first_name: '',
    father_last_name: '',
    father_postnom: '',
    father_status: 'vivant',
    father_nationality: 'Congolaise',
    father_nin: '',
    father_birth_place: '',
    father_birth_date: '',
    father_province: '',
    father_territory: '',
    father_sector: '',
    father_groupement: '',
    father_village: '',
    father_address: '',
    mother_first_name: '',
    mother_last_name: '',
    mother_postnom: '',
    mother_status: 'vivante',
    mother_nationality: 'Congolaise',
    mother_nin: '',
    mother_birth_place: '',
    mother_birth_date: '',
    mother_province: '',
    mother_territory: '',
    mother_sector: '',
    mother_groupement: '',
    mother_village: '',
    mother_address: '',
    guardian_first_name: '',
    guardian_last_name: '',
    guardian_postnom: '',
    guardian_relationship: '',
    guardian_nationality: '',
    guardian_nin: '',
    guardian_address: '',
    guardian_gender: '',
    education_level: '',
    education_other: '',
    profession_code: '',
    profession_other: '',
    has_disability: false,
    disability_code: '',
    id_document_type: '',
    id_document_number: '',
    id_document_issue_date: '',
    id_document_expiry_date: '',
    id_document_nin: '',
    witness1_first_name: '',
    witness1_last_name: '',
    witness1_postnom: '',
    witness1_nin: '',
    witness2_first_name: '',
    witness2_last_name: '',
    witness2_postnom: '',
    witness2_nin: '',
    declaration_date: new Date().toISOString().split('T')[0],
    declaration_place: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const categories = [
    'Majeur', 'Élève', 'Enfant', 'Militaire', 'Policier', 
    'Prisonnier', 'Congolais de l\'étranger', 'Déplacé interne',
    'Informations essentielles', 'PVZC', 'Réfugié', 'Étranger'
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const eyeColors = ['Marron', 'Noir', 'Bleu', 'Vert', 'Gris'];

  const educationLevels = [
    { value: 'certificat_p6', label: 'Certificat P6' },
    { value: 'diplome_d6', label: 'Diplôme D6' },
    { value: 'graduat', label: 'Graduat' },
    { value: 'licence', label: 'Licence' },
    { value: 'master', label: 'Master' },
    { value: 'doctorat', label: 'Doctorat' },
    { value: '', label: 'Non spécifié' }
  ];

  const documentTypes = [
    'Acte de naissance', 'Carte militaire', 'Carte policière', 
    'Carte d\'identité', 'Carte d\'électeur', 'Passeport', 
    'Carte de résidence', 'Certificat de nationalité', 
    'Attestation demandeur d\'asile', 'TVC'
  ];

  // Load GeoJSON data
  useEffect(() => {
    fetch('/data/entites_admin.json')
      .then(res => res.json())
      .then(data => {
        const features = data.features || [];
        setAdminData(features);
        const uniqueProvinces = [...new Set(features.map(f => f.properties?.PROVINCE).filter(Boolean))];
        setProvinces(uniqueProvinces.sort());
        
        const territories = {};
        const sectors = {};
        const groupements = {};
        const villages = {};
        
        features.forEach(f => {
          const province = f.properties?.PROVINCE;
          const territory = f.properties?.TERRITOIRE_VILLE;
          const sector = f.properties?.SECTEUR_CHEFFERIE_COMMNE;
          const groupement = f.properties?.GROUPEMENT_QUARTIER;
          const village = f.properties?.VILLAGE;
          
          if (province && territory) {
            if (!territories[province]) territories[province] = new Set();
            territories[province].add(territory);
          }
          if (territory && sector) {
            if (!sectors[territory]) sectors[territory] = new Set();
            sectors[territory].add(sector);
          }
          if (sector && groupement) {
            if (!groupements[sector]) groupements[sector] = new Set();
            groupements[sector].add(groupement);
          }
          if (groupement && village) {
            if (!villages[groupement]) villages[groupement] = new Set();
            villages[groupement].add(village);
          }
        });
        
        setTerritoriesCache(Object.fromEntries(Object.entries(territories).map(([k,v]) => [k, [...v].sort()])));
        setSectorsCache(Object.fromEntries(Object.entries(sectors).map(([k,v]) => [k, [...v].sort()])));
        setGroupementsCache(Object.fromEntries(Object.entries(groupements).map(([k,v]) => [k, [...v].sort()])));
        setVillagesCache(Object.fromEntries(Object.entries(villages).map(([k,v]) => [k, [...v].sort()])));
      })
      .catch(err => console.error('Error loading admin data:', err));
  }, []);

  const validateField = (name, value) => {
    const requiredFields = ['category', 'first_name', 'last_name', 'nationality', 'birth_place', 'birth_date', 'gender'];
    if (requiredFields.includes(name) && !value) {
      return 'Ce champ est requis';
    }
    return '';
  };

  // Handle change with phone number validation (only numbers)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For phone fields, only allow numbers
    if (name === 'phone1' || name === 'phone2') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      
      // Validate field and set error
      const errorMsg = validateField(name, numericValue);
      setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
      
      // Validate field and set error
      const errorMsg = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
    
    // Clear general error when user starts typing
    if (error) setError('');
  };

  const handleProvinceChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      [field.replace('province', 'territory')]: '',
      [field.replace('province', 'sector')]: '',
      [field.replace('province', 'groupement')]: '',
      [field.replace('province', 'village')]: ''
    }));
  };

  const handleTerritoryChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      [field.replace('territory', 'sector')]: '',
      [field.replace('territory', 'groupement')]: '',
      [field.replace('territory', 'village')]: ''
    }));
  };

  const handleSectorChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      [field.replace('sector', 'groupement')]: '',
      [field.replace('sector', 'village')]: ''
    }));
  };

  const handleGroupementChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      [field.replace('groupement', 'village')]: ''
    }));
  };

  const handleChildChange = (index, field, value) => {
    const newChildren = [...formData.children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setFormData(prev => ({ ...prev, children: newChildren }));
  };

  const addChild = () => {
    if (formData.children.length < 6) {
      setFormData(prev => ({
        ...prev,
        children: [...prev.children, { first_name: '', last_name: '', postnom: '', birth_place: '', birth_date: '', gender: '' }]
      }));
    }
  };

  const removeChild = (index) => {
    const newChildren = formData.children.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, children: newChildren }));
  };

  const formatDate = (dateValue) => {
    if (!dateValue || dateValue === '') return null;
    return dateValue;
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setStep(1);
    setShowSuccessModal(false);
    setShowQRCode(false);
    setFieldErrors({});
    window.scrollTo(0, 0);
  };

  const isStepValid = () => {
    const errors = {};
    switch(step) {
      case 1:
        if (!formData.category) errors.category = 'Ce champ est requis';
        break;
      case 2:
        if (!formData.first_name) errors.first_name = 'Ce champ est requis';
        if (!formData.last_name) errors.last_name = 'Ce champ est requis';
        if (!formData.nationality) errors.nationality = 'Ce champ est requis';
        if (!formData.birth_place) errors.birth_place = 'Ce champ est requis';
        if (!formData.birth_date) errors.birth_date = 'Ce champ est requis';
        if (!formData.gender) errors.gender = 'Ce champ est requis';
        break;
      default:
        break;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields for step 7
    if (!document.getElementById('declaration-checkbox')?.checked) {
      setFieldErrors({ declaration: 'Vous devez accepter la déclaration' });
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    const regNumber = `ONIP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    setRegistrationNumber(regNumber);
    
    const qrJsonData = JSON.stringify({
      registration_number: regNumber,
      first_name: formData.first_name,
      last_name: formData.last_name,
      birth_date: formData.birth_date,
      category: formData.category,
      province: formData.identification_province
    });
    setQrData(qrJsonData);

    const dataToSubmit = {
      ...formData,
      registration_number: regNumber,
      children_count: formData.children_count === '' ? 0 : parseInt(formData.children_count) || 0,
      height_cm: formData.height_cm === '' ? null : parseInt(formData.height_cm) || null,
      birth_date: formatDate(formData.birth_date),
      spouse_birth_date: formatDate(formData.spouse_birth_date),
      father_birth_date: formatDate(formData.father_birth_date),
      mother_birth_date: formatDate(formData.mother_birth_date),
      id_document_issue_date: formatDate(formData.id_document_issue_date),
      id_document_expiry_date: formatDate(formData.id_document_expiry_date),
      declaration_date: formatDate(formData.declaration_date),
      education_level: formData.education_level === '' ? null : formData.education_level,
      children: formData.children.map(child => ({ ...child, birth_date: formatDate(child.birth_date) }))
    };

    const { data, error } = await supabase
      .from('applicants')
      .insert([dataToSubmit])
      .select();

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(`Inscription réussie! Votre numéro: ${regNumber}`);
      setShowSuccessModal(true);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    setShowQRCode(false);
    resetForm();
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderLocationFields = (prefix) => {
    const province = formData[`${prefix}_province`];
    const territory = formData[`${prefix}_territory`];
    const sector = formData[`${prefix}_sector`];
    const groupement = formData[`${prefix}_groupement`];
    
    const territoriesList = province ? territoriesCache[province] || [] : [];
    const sectorsList = territory ? sectorsCache[territory] || [] : [];
    const groupementsList = sector ? groupementsCache[sector] || [] : [];
    const villagesList = groupement ? villagesCache[groupement] || [] : [];

    return (
      <>
        <div className="form-row-two">
          <div className="form-group">
            <label>Province</label>
            <select 
              name={`${prefix}_province`} 
              value={formData[`${prefix}_province`]} 
              onChange={(e) => handleProvinceChange(`${prefix}_province`, e.target.value)}
            >
              <option value="">Sélectionner</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label>Territoire/Ville</label>
            <select 
              name={`${prefix}_territory`} 
              value={formData[`${prefix}_territory`]} 
              onChange={(e) => handleTerritoryChange(`${prefix}_territory`, e.target.value)}
              disabled={!province}
            >
              <option value="">Sélectionner</option>
              {territoriesList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row-two">
          <div className="form-group">
            <label>Secteur/Chefferie/Commune</label>
            <select 
              name={`${prefix}_sector`} 
              value={formData[`${prefix}_sector`]} 
              onChange={(e) => handleSectorChange(`${prefix}_sector`, e.target.value)}
              disabled={!territory}
            >
              <option value="">Sélectionner</option>
              {sectorsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label>Groupement/Quartier</label>
            <select 
              name={`${prefix}_groupement`} 
              value={formData[`${prefix}_groupement`]} 
              onChange={(e) => handleGroupementChange(`${prefix}_groupement`, e.target.value)}
              disabled={!sector}
            >
              <option value="">Sélectionner</option>
              {groupementsList.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row-two">
          <div className="form-group">
            <label>Village</label>
            <select 
              name={`${prefix}_village`} 
              value={formData[`${prefix}_village`]} 
              onChange={handleChange}
              disabled={!groupement}
            >
              <option value="">Sélectionner</option>
              {villagesList.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          
          {prefix === 'residence' || prefix === 'domicile' ? (
            <div className="form-group">
              <label>Adresse (N°/Avenue/Rue)</label>
              <input type="text" name={`${prefix}_address`} value={formData[`${prefix}_address`]} onChange={handleChange} />
            </div>
          ) : null}
        </div>
      </>
    );
  };

  const StepIndicator = () => {
    const steps = [1, 2, 3, 4, 5, 6, 7];
    return (
      <div className="step-indicator">
        {steps.map((s, index) => (
          <React.Fragment key={s}>
            <span 
              className={`step-number ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}
              onClick={() => step > s && setStep(s)}
              style={{ cursor: step > s ? 'pointer' : 'default' }}
            >
              {step > s ? '✓' : s}
            </span>
            {index < steps.length - 1 && <span className="step-dash">—</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="registration-container">
      <div className="registration-header">
        <div className="header-top">
          <img src="/onip-logo.png" alt="Logo ONIP" className="header-logo" />
          <div className="header-text">
            <h1>🇨🇩 FICHE NATIONALE D'IDENTIFICATION</h1>
            <p>OFFICE NATIONAL D'IDENTIFICATION DE LA POPULATION (ONIP)</p>
          </div>
        </div>
        <StepIndicator />
      </div>

      <div className="form-content">
        {/* Auto-hide messages */}
        {error && <div className="error-message-global">{error}</div>}
        {success && !showSuccessModal && <div className="success-message-global">{success}</div>}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="success-modal-overlay">
            <div className="success-modal">
              <div className="success-icon">✅</div>
              <h3>Inscription Réussie !</h3>
              <p className="file-number-label">Votre numéro du dossier est :</p>
              <div className="registration-number">
                <span>{registrationNumber}</span>
              </div>
              
              {!showQRCode ? (
                <div className="qr-question">
                  <button onClick={() => setShowQRCode(true)} className="btn-qr">📱 Voir le code QR</button>
                  <button onClick={closeModal} className="btn-close-modal">Fermer</button>
                </div>
              ) : (
                <div className="qr-container">
                  <QRCodeSVG value={qrData} size={150} />
                  <p className="qr-note">Scannez ce code</p>
                  <button onClick={closeModal} className="btn-close-modal">Fermer</button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Catégorie */}
          {step === 1 && (
            <div className="form-section">
              <h2>1. CATÉGORIE DU REQUÉRANT</h2>
              <div className="categories-grid">
                {categories.map(cat => (
                  <label key={cat} className={`category-option ${formData.category === cat ? 'selected' : ''}`}>
                    <input type="radio" name="category" value={cat} checked={formData.category === cat} onChange={handleChange} />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.category && <div className="field-error">{fieldErrors.category}</div>}
              <div className="form-buttons">
                <button type="button" className="btn-next" onClick={handleNext} disabled={!formData.category}>Suivant →</button>
              </div>
            </div>
          )}

          {/* STEP 2: Identité */}
          {step === 2 && (
            <div className="form-section">
              <h2>2. IDENTITÉ DU REQUÉRANT</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom <span className="required">*</span></label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
                  {fieldErrors.first_name && <div className="field-error">{fieldErrors.first_name}</div>}
                </div>
                <div className="form-group">
                  <label>Nom <span className="required">*</span></label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
                  {fieldErrors.last_name && <div className="field-error">{fieldErrors.last_name}</div>}
                </div>
                <div className="form-group">
                  <label>Postnom</label>
                  <input type="text" name="postnom" value={formData.postnom} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nationalité <span className="required">*</span></label>
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} />
                  {fieldErrors.nationality && <div className="field-error">{fieldErrors.nationality}</div>}
                </div>
                <div className="form-group">
                  <label>Lieu de naissance <span className="required">*</span></label>
                  <input type="text" name="birth_place" value={formData.birth_place} onChange={handleChange} />
                  {fieldErrors.birth_place && <div className="field-error">{fieldErrors.birth_place}</div>}
                </div>
                <div className="form-group">
                  <label>Date de naissance <span className="required">*</span></label>
                  <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} />
                  {fieldErrors.birth_date && <div className="field-error">{fieldErrors.birth_date}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sexe <span className="required">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                  {fieldErrors.gender && <div className="field-error">{fieldErrors.gender}</div>}
                </div>
                <div className="form-group">
                  <label>Taille (cm)</label>
                  <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Couleur des yeux</label>
                  <select name="eye_color" value={formData.eye_color} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {eyeColors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Groupe sanguin</label>
                  <select name="blood_type" value={formData.blood_type} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Rhésus</label>
                  <select name="rhesus" value={formData.rhesus} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    <option value="+">Positif (+)</option>
                    <option value="-">Négatif (-)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>BP</label>
                  <input type="text" name="bp" value={formData.bp} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone 1</label>
                  <input 
                    type="tel" 
                    name="phone1" 
                    value={formData.phone1} 
                    onChange={handleChange} 
                    placeholder="Ex: 243812345678"
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone 2</label>
                  <input 
                    type="tel" 
                    name="phone2" 
                    value={formData.phone2} 
                    onChange={handleChange} 
                    placeholder="Ex: 243812345678"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
              <div className="form-buttons">
                <button type="button" className="btn-prev" onClick={prevStep}>← Précédent</button>
                <button type="button" className="btn-next" onClick={handleNext}>Suivant →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Lieu d'identification + Adresses */}
          {step === 3 && (
            <div className="form-section">
              <h2>3. LIEU D'IDENTIFICATION & ADRESSES</h2>
              
              <h3>LIEU D'IDENTIFICATION</h3>
              {renderLocationFields('identification')}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Bureau d'identité</label>
                  <input type="text" name="identification_bureau" value={formData.identification_bureau} onChange={handleChange} />
                </div>
              </div>

              <h3>ORIGINE DU REQUÉRANT</h3>
              {renderLocationFields('origin')}

              <h3>ADRESSE DE RÉSIDENCE</h3>
              {renderLocationFields('residence')}

              <h3>ADRESSE DE DOMICILE</h3>
              {renderLocationFields('domicile')}

              <div className="form-buttons">
                <button type="button" className="btn-prev" onClick={prevStep}>← Précédent</button>
                <button type="button" className="btn-next" onClick={nextStep}>Suivant →</button>
              </div>
            </div>
          )}

          {/* STEP 4: Situation Familiale */}
          {step === 4 && (
            <div className="form-section">
              <h2>4. SITUATION FAMILIALE</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Situation matrimoniale</label>
                  <select name="marital_status" value={formData.marital_status} onChange={handleChange}>
                    <option value="celibataire">Célibataire</option>
                    <option value="marie">Marié(e)</option>
                    <option value="divorce">Divorcé(e)</option>
                    <option value="veuf">Veuf/Veuve</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nombre d'enfants</label>
                  <input type="number" name="children_count" value={formData.children_count} onChange={handleChange} min="0" max="20" />
                </div>
              </div>

              {formData.marital_status === 'marie' && (
                <>
                  <h3>Conjoint(e)</h3>
                  <div className="form-row">
                    <div className="form-group"><label>Prénom</label><input type="text" name="spouse_first_name" value={formData.spouse_first_name} onChange={handleChange} /></div>
                    <div className="form-group"><label>Nom</label><input type="text" name="spouse_last_name" value={formData.spouse_last_name} onChange={handleChange} /></div>
                    <div className="form-group"><label>Postnom</label><input type="text" name="spouse_postnom" value={formData.spouse_postnom} onChange={handleChange} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Nationalité</label><input type="text" name="spouse_nationality" value={formData.spouse_nationality} onChange={handleChange} /></div>
                    <div className="form-group"><label>Lieu de naissance</label><input type="text" name="spouse_birth_place" value={formData.spouse_birth_place} onChange={handleChange} /></div>
                    <div className="form-group"><label>Date de naissance</label><input type="date" name="spouse_birth_date" value={formData.spouse_birth_date} onChange={handleChange} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Sexe</label><select name="spouse_gender" value={formData.spouse_gender} onChange={handleChange}><option value="">Sélectionner</option><option value="M">M</option><option value="F">F</option></select></div>
                    <div className="form-group"><label>NIN</label><input type="text" name="spouse_nin" value={formData.spouse_nin} onChange={handleChange} /></div>
                  </div>
                </>
              )}

              {parseInt(formData.children_count) > 0 && (
                <>
                  <h3>Liste des enfants</h3>
                  {Array.from({ length: Math.min(parseInt(formData.children_count), 6) }).map((_, idx) => (
                    <div key={idx} className="children-list">
                      <div className="children-header"><strong>Enfant {idx + 1}</strong></div>
                      <div className="form-row">
                        <div className="form-group"><label>Prénom</label><input type="text" value={formData.children[idx]?.first_name || ''} onChange={(e) => handleChildChange(idx, 'first_name', e.target.value)} /></div>
                        <div className="form-group"><label>Nom</label><input type="text" value={formData.children[idx]?.last_name || ''} onChange={(e) => handleChildChange(idx, 'last_name', e.target.value)} /></div>
                        <div className="form-group"><label>Postnom</label><input type="text" value={formData.children[idx]?.postnom || ''} onChange={(e) => handleChildChange(idx, 'postnom', e.target.value)} /></div>
                      </div>
                      <div className="form-row">
                        <div className="form-group"><label>Lieu de naissance</label><input type="text" value={formData.children[idx]?.birth_place || ''} onChange={(e) => handleChildChange(idx, 'birth_place', e.target.value)} /></div>
                        <div className="form-group"><label>Date de naissance</label><input type="date" value={formData.children[idx]?.birth_date || ''} onChange={(e) => handleChildChange(idx, 'birth_date', e.target.value)} /></div>
                        <div className="form-group"><label>Sexe</label><select value={formData.children[idx]?.gender || ''} onChange={(e) => handleChildChange(idx, 'gender', e.target.value)}><option value="">Sélectionner</option><option value="M">M</option><option value="F">F</option></select></div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className="form-buttons">
                <button type="button" className="btn-prev" onClick={prevStep}>← Précédent</button>
                <button type="button" className="btn-next" onClick={nextStep}>Suivant →</button>
              </div>
            </div>
          )}

          {/* STEP 5: Parents */}
          {step === 5 && (
            <div className="form-section">
              <h2>5. IDENTITÉ DES PARENTS</h2>
              
              <h3>Père</h3>
              <div className="form-row">
                <div className="form-group"><label>Prénom</label><input type="text" name="father_first_name" value={formData.father_first_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Nom</label><input type="text" name="father_last_name" value={formData.father_last_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Postnom</label><input type="text" name="father_postnom" value={formData.father_postnom} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Statut</label><select name="father_status" value={formData.father_status} onChange={handleChange}><option value="vivant">En vie</option><option value="decede">Décédé</option></select></div>
                <div className="form-group"><label>Nationalité</label><input type="text" name="father_nationality" value={formData.father_nationality} onChange={handleChange} /></div>
                <div className="form-group"><label>NIN</label><input type="text" name="father_nin" value={formData.father_nin} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Lieu de naissance</label><input type="text" name="father_birth_place" value={formData.father_birth_place} onChange={handleChange} /></div>
                <div className="form-group"><label>Date de naissance</label><input type="date" name="father_birth_date" value={formData.father_birth_date} onChange={handleChange} /></div>
              </div>
              
              <h3>Mère</h3>
              <div className="form-row">
                <div className="form-group"><label>Prénom</label><input type="text" name="mother_first_name" value={formData.mother_first_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Nom</label><input type="text" name="mother_last_name" value={formData.mother_last_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Postnom</label><input type="text" name="mother_postnom" value={formData.mother_postnom} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Statut</label><select name="mother_status" value={formData.mother_status} onChange={handleChange}><option value="vivante">En vie</option><option value="decedee">Décédée</option></select></div>
                <div className="form-group"><label>Nationalité</label><input type="text" name="mother_nationality" value={formData.mother_nationality} onChange={handleChange} /></div>
                <div className="form-group"><label>NIN</label><input type="text" name="mother_nin" value={formData.mother_nin} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Lieu de naissance</label><input type="text" name="mother_birth_place" value={formData.mother_birth_place} onChange={handleChange} /></div>
                <div className="form-group"><label>Date de naissance</label><input type="date" name="mother_birth_date" value={formData.mother_birth_date} onChange={handleChange} /></div>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-prev" onClick={prevStep}>← Précédent</button>
                <button type="button" className="btn-next" onClick={nextStep}>Suivant →</button>
              </div>
            </div>
          )}

          {/* STEP 6: Tuteur, Études, Profession, Handicap */}
          {step === 6 && (
            <div className="form-section">
              <h2>6. TUTEUR, ÉTUDES, PROFESSION, HANDICAP</h2>
              
              <h3>TUTEUR (si applicable)</h3>
              <div className="form-row">
                <div className="form-group"><label>Prénom</label><input type="text" name="guardian_first_name" value={formData.guardian_first_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Nom</label><input type="text" name="guardian_last_name" value={formData.guardian_last_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Postnom</label><input type="text" name="guardian_postnom" value={formData.guardian_postnom} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nature du lien</label>
                  <select name="guardian_relationship" value={formData.guardian_relationship} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {relationshipTypes.map(rel => <option key={rel} value={rel}>{rel}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Nationalité</label><input type="text" name="guardian_nationality" value={formData.guardian_nationality} onChange={handleChange} /></div>
                <div className="form-group"><label>NIN</label><input type="text" name="guardian_nin" value={formData.guardian_nin} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Adresse</label><input type="text" name="guardian_address" value={formData.guardian_address} onChange={handleChange} /></div>
                <div className="form-group"><label>Sexe</label><select name="guardian_gender" value={formData.guardian_gender} onChange={handleChange}><option value="">Sélectionner</option><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
              </div>

              <h3>NIVEAU D'ÉTUDES</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Niveau</label>
                  <select name="education_level" value={formData.education_level} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {educationLevels.map(el => <option key={el.value} value={el.value}>{el.label}</option>)}
                  </select>
                </div>
              </div>

              <h3>PROFESSION</h3>
              <div className="form-row">
                <div className="form-group"><label>Code profession</label><input type="text" name="profession_code" value={formData.profession_code} onChange={handleChange} placeholder="Ex: 001" /></div>
                <div className="form-group"><label>Autre précision</label><input type="text" name="profession_other" value={formData.profession_other} onChange={handleChange} /></div>
              </div>

              <h3>HANDICAP</h3>
              <div className="form-group">
                <label className="italic-label"><em>Personne vivant avec handicap ?</em></label>
                <select name="has_disability" value={formData.has_disability} onChange={handleChange}>
                  <option value="">Sélectionner</option>
                  <option value={false}>Non</option>
                  <option value={true}>Oui</option>
                </select>
              </div>
              {formData.has_disability && (
                <div className="form-group">
                  <label>Code handicap</label>
                  <input type="text" name="disability_code" value={formData.disability_code} onChange={handleChange} placeholder="Code" />
                </div>
              )}

              <div className="form-buttons">
                <button type="button" className="btn-prev" onClick={prevStep}>← Précédent</button>
                <button type="button" className="btn-next" onClick={nextStep}>Suivant →</button>
              </div>
            </div>
          )}

          {/* STEP 7: Document, Témoins, Signature */}
          {step === 7 && (
            <div className="form-section">
              <h2>7. PIÈCE PRÉSENTÉE & SIGNATURE</h2>
              
              <h3>PIÈCE PRÉSENTÉE</h3>
              <div className="form-row">
                <div className="form-group"><label>Type de pièce</label><select name="id_document_type" value={formData.id_document_type} onChange={handleChange}><option value="">Sélectionner</option>{documentTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}</select></div>
                <div className="form-group"><label>Numéro</label><input type="text" name="id_document_number" value={formData.id_document_number} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Date de délivrance</label><input type="date" name="id_document_issue_date" value={formData.id_document_issue_date} onChange={handleChange} /></div>
                <div className="form-group"><label>Date d'expiration</label><input type="date" name="id_document_expiry_date" value={formData.id_document_expiry_date} onChange={handleChange} /></div>
                <div className="form-group"><label>NIN</label><input type="text" name="id_document_nin" value={formData.id_document_nin} onChange={handleChange} /></div>
              </div>

              <h3>TÉMOINS</h3>
              <div className="form-row">
                <div className="form-group"><label>Témoin 1 (Prénom)</label><input type="text" name="witness1_first_name" value={formData.witness1_first_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Nom</label><input type="text" name="witness1_last_name" value={formData.witness1_last_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Postnom</label><input type="text" name="witness1_postnom" value={formData.witness1_postnom} onChange={handleChange} /></div>
                <div className="form-group"><label>NIN</label><input type="text" name="witness1_nin" value={formData.witness1_nin} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Témoin 2 (Prénom)</label><input type="text" name="witness2_first_name" value={formData.witness2_first_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Nom</label><input type="text" name="witness2_last_name" value={formData.witness2_last_name} onChange={handleChange} /></div>
                <div className="form-group"><label>Postnom</label><input type="text" name="witness2_postnom" value={formData.witness2_postnom} onChange={handleChange} /></div>
                <div className="form-group"><label>NIN</label><input type="text" name="witness2_nin" value={formData.witness2_nin} onChange={handleChange} /></div>
              </div>

              <h3>DÉCLARATION</h3>
              <div className="form-group checkbox">
                <label>
                  <input id="declaration-checkbox" type="checkbox" required /> Je déclare que toutes les informations sont vraies et exactes.
                </label>
                {fieldErrors.declaration && <div className="field-error">{fieldErrors.declaration}</div>}
              </div>
              <div className="form-row">
                <div className="form-group"><label>Fait à</label><input type="text" name="declaration_place" value={formData.declaration_place} onChange={handleChange} placeholder="Lieu" /></div>
                <div className="form-group"><label>Le</label><input type="date" name="declaration_date" value={formData.declaration_date} onChange={handleChange} /></div>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-prev" onClick={prevStep}>← Précédent</button>
                <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="registration-footer">
        <p>© ONIP - Office National d'Identification de la Population - République Démocratique du Congo</p>
      </div>

      {loading && <div className="loading-overlay"><div className="loading-spinner"></div></div>}
    </div>
  );
};

export default RegistrationForm;