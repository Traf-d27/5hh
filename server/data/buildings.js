export const CAMPUS_BUILDINGS = [
  {
    id: "bldg-eng",
    name: "Engineering Complex (Blocks A & B)",
    code: "ENG-AB",
    category: "Academic & Heavy Labs",
    areaSqMeters: 18500,
    operatingHours: {
      open: "08:00",
      close: "19:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    baseLoadKwh: 35.0,
    peakLoadKwh: 240.0,
    meterId: "MTR-ENG-001",
    meterLocation: "Substation 2 - Feeder 4A",
    description: "Hosts computing clusters, wind tunnel, mechanical workshops and lecture halls.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bldg-sci",
    name: "Science & Advanced Research Block",
    code: "SCI-RES",
    category: "Wet Labs & Clean Rooms",
    areaSqMeters: 14200,
    operatingHours: {
      open: "08:30",
      close: "20:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    },
    baseLoadKwh: 45.0, // higher baseline due to fume hoods & minus 80C freezers
    peakLoadKwh: 195.0,
    meterId: "MTR-SCI-002",
    meterLocation: "Substation 1 - Feeder 2B",
    description: "Contains biosafety chemistry hoods, analytical spectrometers and ultracold freezers.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bldg-lib",
    name: "Central Knowledge Library & IT Commons",
    code: "LIB-CTR",
    category: "Library & IT Commons",
    areaSqMeters: 9800,
    operatingHours: {
      open: "08:00",
      close: "22:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    baseLoadKwh: 18.0,
    peakLoadKwh: 125.0,
    meterId: "MTR-LIB-003",
    meterLocation: "Main Distribution Board - Panel L",
    description: "Four-tier air-conditioned reading halls, high-density server rack room, and e-learning zones.",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bldg-admin",
    name: "Chancellery & Administrative Pavilion",
    code: "ADM-MAIN",
    category: "Administrative & Executive",
    areaSqMeters: 6400,
    operatingHours: {
      open: "09:00",
      close: "17:30",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    },
    baseLoadKwh: 12.0,
    peakLoadKwh: 85.0,
    meterId: "MTR-ADM-004",
    meterLocation: "Admin Block Basemen Electrical Room",
    description: "Offices of registrar, student affairs, boardrooms and finance department.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bldg-hostel",
    name: "Kaveri & Ganga Student Residences",
    code: "HST-KG",
    category: "Residential Hostels",
    areaSqMeters: 24000,
    operatingHours: {
      open: "00:00",
      close: "23:59",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    baseLoadKwh: 28.0,
    peakLoadKwh: 210.0, // peaks early morning 06:30-09:00 and night 19:00-23:30
    meterId: "MTR-HST-005",
    meterLocation: "Hostel Zone Transformer 3",
    description: "Two 8-storey residential towers housing 1,400 students with dining halls and laundry.",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bldg-sports",
    name: "Auditorium & Indoor Sports Complex",
    code: "SPT-AUD",
    category: "Events & Athletics",
    areaSqMeters: 11000,
    operatingHours: {
      open: "06:00",
      close: "21:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    baseLoadKwh: 10.0,
    peakLoadKwh: 160.0,
    meterId: "MTR-SPT-006",
    meterLocation: "Arena Control Panel - South",
    description: "1,800-seat convention hall, indoor basketball arena, gym and floodlight arrays.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80"
  }
];
