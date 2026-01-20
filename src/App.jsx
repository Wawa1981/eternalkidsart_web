import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout.jsx";

// Pages
import Landing from "./Pages/Landing.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Museum from "./Pages/Museum.jsx";
import Gallery from "./Pages/Gallery.jsx";
import Community from "./Pages/Community.jsx";
import Shop from "./Pages/Shop.jsx";

function Page({ name, children }) {
  return <Layout currentPageName={name}>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Landing" replace />} />

        <Route
          path="/Landing"
          element={
            <Page name="Landing">
              <Landing />
            </Page>
          }
        />
        <Route
          path="/Dashboard"
          element={
            <Page name="Dashboard">
              <Dashboard />
            </Page>
          }
        />
        <Route
          path="/Museum"
          element={
            <Page name="Museum">
              <Museum />
            </Page>
          }
        />
        <Route
          path="/Gallery"
          element={
            <Page name="Gallery">
              <Gallery />
            </Page>
          }
        />
        <Route
          path="/Community"
          element={
            <Page name="Community">
              <Community />
            </Page>
          }
        />
        <Route
          path="/Shop"
          element={
            <Page name="Shop">
              <Shop />
            </Page>
          }
        />

        <Route path="*" element={<Navigate to="/Landing" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
