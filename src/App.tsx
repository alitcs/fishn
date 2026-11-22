import { Route, Routes } from "react-router-dom";
import { Layout } from "./components";
import {
  Home,
  ExperiencesPage,
  ExperienceDetail,
  ExplorePage,
  LocationDetail,
  AboutPage,
  PrivacyPage,
  NotFound,
} from "./pages";
import { BookingPage } from "./booking/BookingPage";
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="experiences" element={<ExperiencesPage />} />
        <Route path="experiences/:slug" element={<ExperienceDetail />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="explore/:slug" element={<LocationDetail />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="book" element={<BookingPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
