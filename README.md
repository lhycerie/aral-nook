# AralNook — Study Space Finder 📖📍

A web-based geospatial application designed to help students discover study-friendly hubs (cafés, public libraries, coworking spaces) across the Philippines and worldwide, powered by live OpenStreetMap spatial data.

---

## ✨ Features

- **Interactive Spatial Map**: Browse study spots with custom pins, radius boundaries, and responsive pan-to-marker controls using Leaflet.js.
- **Automated OpenStreetMap & Overpass Retrieval**: Real-time study spot queries with multi-mirror failover for high availability.
- **Smart Geocoding**: Instant place search powered by Photon autocomplete and Nominatim.
- **Space Details**: Operating hours, Wi-Fi and power outlet amenities detection, and directions links.
- **Responsive Notebook Dossier**: Clean desktop and mobile notebook experience.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Mapping**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Data**: [OpenStreetMap](https://www.openstreetmap.org/) via Overpass API
- **Language**: TypeScript

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ (Node.js 20+ recommended)
- npm

### Installation & Development

```bash
git clone https://github.com/lhycerie/aral-nook.git
cd aral-nook
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
