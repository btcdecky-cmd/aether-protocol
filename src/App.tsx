import { NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "./routes/HomePage";
import { DiscoverPage } from "./routes/DiscoverPage";
import { CampaignPage } from "./routes/CampaignPage";
import { JourneyPage } from "./routes/JourneyPage";
import { WalletPage } from "./routes/WalletPage";
import { AdvertisePage } from "./routes/AdvertisePage";
import { LendPage } from "./routes/LendPage";
import { BagsPage } from "./routes/BagsPage";
import { HeliusPage } from "./routes/HeliusPage";
import { InventoryPage } from "./routes/InventoryPage";

export function App() {
  return (
    <div className="app-shell">
      <nav className="nav">
        <NavLink to="/" className="brand" end>
          Aether
        </NavLink>
        <NavLink to="/discover">Discover</NavLink>
        <NavLink to="/journey">Journey</NavLink>
        <NavLink to="/wallet">Wallet</NavLink>
        <NavLink to="/advertise">Advertise</NavLink>
        <NavLink to="/inventory">Inventory</NavLink>
        <NavLink to="/lend">Lend</NavLink>
        <NavLink to="/bags">Bags</NavLink>
        <NavLink to="/helius">Helius</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/campaigns/:id" element={<CampaignPage />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/lend" element={<LendPage />} />
        <Route path="/bags" element={<BagsPage />} />
        <Route path="/helius" element={<HeliusPage />} />
      </Routes>

      <nav className="mobile-nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/discover">Discover</NavLink>
        <NavLink to="/journey">Journey</NavLink>
        <NavLink to="/wallet">Wallet</NavLink>
      </nav>
    </div>
  );
}
