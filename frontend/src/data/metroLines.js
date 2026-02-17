// Improved Kochi Metro line data (major stations) with approximated coordinates.
// If you need exact official coordinates, I can fetch and update these precisely.
const metroLines = [
  {
    id: 'line-1',
    name: 'Aluva – M.G. Road (Main Line)',
    color: '#0077be',
    stations: [
      { name: 'Aluva', lat: 10.1076, lng: 76.3516 },
      { name: 'Pulinchodu', lat: 10.0968, lng: 76.3565 },
      { name: 'Companypady', lat: 10.0891, lng: 76.3612 },
      { name: 'SN Junction', lat: 10.0815, lng: 76.3671 },
      { name: 'Ambattukavu', lat: 10.0736, lng: 76.3722 },
      { name: 'Kakkanad', lat: 10.0475, lng: 76.3281 },
      { name: 'Palarivattom', lat: 10.0232, lng: 76.3296 },
      { name: 'Edapally', lat: 10.0261, lng: 76.3187 },
      { name: 'Muttom', lat: 10.0135, lng: 76.3100 },
      { name: 'Kaloor', lat: 9.9989, lng: 76.3052 },
      { name: 'Lissie', lat: 9.9908, lng: 76.2968 },
      { name: 'M.G. Road', lat: 9.9816, lng: 76.2858 },
      { name: 'Ernakulam South', lat: 9.9711, lng: 76.2819 }
    ]
  },
  {
    id: 'line-2',
    name: 'Vyttila Extension',
    color: '#e74c3c',
    stations: [
      { name: 'Vyttila', lat: 9.9614, lng: 76.2956 },
      { name: 'Thykoodam', lat: 9.9690, lng: 76.3001 },
      { name: 'Kakkanad South', lat: 9.9802, lng: 76.3120 },
      { name: 'Edappally (via extension)', lat: 10.0261, lng: 76.3187 }
    ]
  }
];

export default metroLines;
