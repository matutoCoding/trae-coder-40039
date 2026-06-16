import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import SlabCharging from '@/pages/SlabCharging';
import HeatingFurnace from '@/pages/HeatingFurnace';
import RoughingMill from '@/pages/RoughingMill';
import FinishingMill from '@/pages/FinishingMill';
import LaminarCooling from '@/pages/LaminarCooling';
import Coiling from '@/pages/Coiling';
import Inspection from '@/pages/Inspection';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/slab-charging"
          element={
            <Layout>
              <SlabCharging />
            </Layout>
          }
        />
        <Route
          path="/heating-furnace"
          element={
            <Layout>
              <HeatingFurnace />
            </Layout>
          }
        />
        <Route
          path="/roughing-mill"
          element={
            <Layout>
              <RoughingMill />
            </Layout>
          }
        />
        <Route
          path="/finishing-mill"
          element={
            <Layout>
              <FinishingMill />
            </Layout>
          }
        />
        <Route
          path="/laminar-cooling"
          element={
            <Layout>
              <LaminarCooling />
            </Layout>
          }
        />
        <Route
          path="/coiling"
          element={
            <Layout>
              <Coiling />
            </Layout>
          }
        />
        <Route
          path="/inspection"
          element={
            <Layout>
              <Inspection />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
