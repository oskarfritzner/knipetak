import "./ProfilePage.css";
import React, { useState, useEffect } from "react";
import {
  getUserData,
  updateUserProfile,
} from "../../backend/firebase/services/firebase.userservice";
import { useNavigate } from "react-router-dom";
import {
  getUserBookings,
  cancelBooking,
} from "../../backend/firebase/services/firebase.bookingservice";
import { BookingData } from "../../backend/interfaces/BookingData";
import { getTreatments } from "../../backend/firebase/services/firebase.treatmentservice";
import { Treatment } from "../../backend/interfaces/Treatment";
import { Gender, UserData } from "../../backend/interfaces/UserData";
import { useAuth } from "@/context/AuthContext";
import DataExport from "../../components/DataExport/DataExport";
import DeleteAccount from "../../components/DeleteAccount/DeleteAccount";

const Profile: React.FC = () => {
  // Use AuthContext instead of managing our own user state
  const { user, signOut: authSignOut, isLoading: authLoading } = useAuth();
  const [, setUserData] = useState<Partial<UserData> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [gender, setGender] = useState<Gender | "">("");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<number | null>(null);
  const [healthIssues, setHealthIssues] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");
  const [birthYearError, setBirthYearError] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showCancelBookingModal, setShowCancelBookingModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<BookingData | null>(
    null
  );
  const [isCancelling, setIsCancelling] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showHistory, setShowHistory] = useState(true);

  // Reschedule functionality removed per request

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const [userDataResult, userBookings, treatmentsData] =
            await Promise.all([
              getUserData(user.uid),
              getUserBookings(user.uid),
              getTreatments(),
            ]);

          if (userDataResult) {
            setUserData(userDataResult);
            setGender(userDataResult.gender || "");
            setBirthYear(userDataResult.birthYear || "");
            setHealthIssues(userDataResult.healthIssues || "");
            setPhoneNumber(userDataResult.phoneNumber || "");
            if (userDataResult.location) {
              setAddress(userDataResult.location.address || "");
              setCity(userDataResult.location.city || "");
              setPostalCode(userDataResult.location.postalCode || null);
            }
          }

          setBookings(userBookings);
          setTreatments(treatmentsData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]); // Only depend on user from AuthContext

  // Handle escape key and body scroll lock for modals
  useEffect(() => {
    if (showDeleteAccount || showPrivacyModal || showDataExportModal) {
      // Lock body scroll
      document.body.style.overflow = "hidden";

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setShowDeleteAccount(false);
          setShowPrivacyModal(false);
          setShowDataExportModal(false);
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        // Unlock body scroll
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showDeleteAccount, showPrivacyModal, showDataExportModal]);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await authSignOut(); // Use the signOut from AuthContext
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTreatmentName = (treatmentId: string): string => {
    const treatment = treatments.find((t) => t.id === treatmentId);
    return treatment?.name || "Ukjent behandling";
  };

  // Helpers to split bookings into upcoming vs history
  const getBookingStart = (b: BookingData): Date =>
    b.timeslot?.start instanceof Date
      ? b.timeslot.start
      : new Date(b.timeslot?.start);

  const upcomingBookings = bookings
    .filter((b) => b.status !== "cancelled" && getBookingStart(b) > new Date())
    .sort(
      (a, b) => getBookingStart(a).getTime() - getBookingStart(b).getTime()
    );

  const historyBookings = bookings
    .filter(
      (b) => !(b.status !== "cancelled" && getBookingStart(b) > new Date())
    )
    .sort(
      (a, b) => getBookingStart(b).getTime() - getBookingStart(a).getTime()
    );

  // Helper: Determine if booking is upcoming and active
  const isUpcomingActiveBooking = (booking: BookingData): boolean => {
    try {
      const now = new Date();
      const start =
        booking.timeslot?.start instanceof Date
          ? booking.timeslot.start
          : new Date(booking.timeslot?.start);
      return booking.status !== "cancelled" && start.getTime() > now.getTime();
    } catch {
      return booking.status !== "cancelled";
    }
  };

  // Reschedule helper removed

  // Helper: Cancellation policy warning based on hours until start
  const getCancellationWarning = (booking: BookingData): string => {
    try {
      const now = new Date();
      const start =
        booking.timeslot?.start instanceof Date
          ? booking.timeslot.start
          : new Date(booking.timeslot?.start);
      const hours = (start.getTime() - now.getTime()) / 36e5;
      if (hours < 24) {
        return "Avbestilling mindre enn 24 timer før: Full pris kan belastes.";
      }
      if (hours < 48) {
        return "Avbestilling 24–48 timer før: 50% av prisen kan belastes.";
      }
      return "";
    } catch {
      return "";
    }
  };

  // Cancel flow
  const openCancelModal = (booking: BookingData) => {
    setBookingToCancel(booking);
    setShowCancelBookingModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelBookingModal(false);
    setBookingToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel?.bookingId) return;
    setIsCancelling(true);
    try {
      await cancelBooking(bookingToCancel.bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingToCancel.bookingId
            ? { ...b, status: "cancelled" }
            : b
        )
      );
      closeCancelModal();
    } catch (error) {
      console.error("Feil ved kansellering av booking:", error);
      alert("Det oppsto en feil ved kansellering. Vennligst prøv igjen.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Reschedule functions removed

  // Valideringsfunksjoner
  const validateBirthYear = (value: string) => {
    const numValue = parseInt(value);
    const currentYear = new Date().getFullYear();

    if (isNaN(numValue)) {
      setBirthYearError("Fødselsår må være et tall");
      return false;
    }
    if (numValue < 1900 || numValue > currentYear) {
      setBirthYearError(`Fødselsår må være mellom 1900 og ${currentYear}`);
      return false;
    }
    if (!Number.isInteger(numValue)) {
      setBirthYearError("Fødselsår må være et helt tall");
      return false;
    }
    setBirthYearError("");
    return true;
  };

  const validateAddress = (value: string) => {
    // Norsk adresseformat: Gatenavn nummer, f.eks. "Kongens gate 1" eller "Slottsplassen 1"
    const addressRegex = /^[a-zA-ZæøåÆØÅ\s]+ \d+$/;
    if (!addressRegex.test(value)) {
      setAddressError("Ugyldig adresse. Må være på format: Gatenavn nummer");
      return false;
    }
    setAddressError("");
    return true;
  };

  const validatePhoneNumber = (value: string) => {
    // Norsk telefonnummerformat: 8 siffer, kan starte med +47 eller 0047
    const phoneRegex = /^(\+47|0047)?\s*[2-9]\d{7}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      setPhoneError(
        "Ugyldig telefonnummer. Må være 8 siffer og kan starte med +47"
      );
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSave = async () => {
    if (!user) return;

    // Validerer kun de feltene som faktisk er endret
    const updatedData: Partial<UserData> = {};

    if (birthYear !== "") {
      const isBirthYearValid = validateBirthYear(birthYear.toString());
      if (!isBirthYearValid) return;
      updatedData.birthYear = Number(birthYear);
    }

    if (address !== "") {
      const isAddressValid = validateAddress(address);
      if (!isAddressValid) return;
      updatedData.location = {
        id: "default-id",
        name: "default-name",
        address,
        city,
        postalCode: postalCode || 0,
      };
    }

    if (phoneNumber !== "") {
      const isPhoneValid = validatePhoneNumber(phoneNumber);
      if (!isPhoneValid) return;
      updatedData.phoneNumber = phoneNumber;
    }

    if (gender !== "") {
      updatedData.gender = gender as Gender;
    }

    if (healthIssues !== "") {
      updatedData.healthIssues = healthIssues;
    }

    // Hvis ingen felt er endret, avbryt
    if (Object.keys(updatedData).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, updatedData);
      setUserData((prev) => ({ ...prev, ...updatedData }));
      setIsEditing(false);
    } catch (error) {
      console.error("Feil ved lagring av profil:", error);
      alert(
        "Det oppsto en feil ved lagring av profilen. Vennligst prøv igjen."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="main-container">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-header">
              <h2 className="profile-name">{user?.displayName || "Bruker"}</h2>
              <p className="profile-email">
                {user?.email || "Ingen e-post tilgjengelig"}
              </p>
            </div>

            <div className="profile-actions">
              <button
                className={`action-button ${isEditing ? "active" : ""}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Avbryt" : "Rediger Profil"}
              </button>
              <button
                className="action-button delete"
                onClick={() => setShowDeleteAccount(true)}
              >
                Slett Profil
              </button>
              <button
                className="action-button privacy"
                onClick={() => setShowPrivacyModal(true)}
              >
                🛡️ Personvern
              </button>
              <button className="action-button logout" onClick={handleSignOut}>
                Logg ut
              </button>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-section">
              <h3>Personlig Informasjon</h3>
              {isLoading ? (
                <p>Laster inn brukerdata...</p>
              ) : (
                <div className="info-grid">
                  <div className="info-item">
                    <label>Kjønn</label>
                    <p>
                      {isEditing ? (
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as Gender)}
                          className="form-select"
                        >
                          <option value="">Velg kjønn</option>
                          {Object.values(Gender).map((genderOption) => (
                            <option key={genderOption} value={genderOption}>
                              {genderOption}
                            </option>
                          ))}
                        </select>
                      ) : (
                        gender || "Ikke spesifisert"
                      )}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Fødselsår</label>
                    <p>
                      {isEditing ? (
                        <div className="input-with-error">
                          <input
                            type="number"
                            value={birthYear}
                            onChange={(e) => {
                              const value = e.target.value;
                              setBirthYear(value === "" ? "" : parseInt(value));
                              validateBirthYear(value);
                            }}
                            min="1900"
                            max={new Date().getFullYear()}
                            step="1"
                          />
                          {birthYearError && (
                            <span className="error-message">
                              {birthYearError}
                            </span>
                          )}
                        </div>
                      ) : (
                        birthYear || "Ikke spesifisert"
                      )}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Adresse</label>
                    <p>
                      {isEditing ? (
                        <div className="input-with-error">
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => {
                              const value = e.target.value;
                              setAddress(value);
                              validateAddress(value);
                            }}
                            placeholder="F.eks: Kongens gate 1"
                          />
                          {addressError && (
                            <span className="error-message">
                              {addressError}
                            </span>
                          )}
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="By"
                            className="mt-2"
                          />
                          <input
                            type="number"
                            value={postalCode || ""}
                            onChange={(e) =>
                              setPostalCode(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            placeholder="Postnummer"
                            className="mt-2"
                          />
                        </div>
                      ) : address ? (
                        `${address}, ${postalCode} ${city}`
                      ) : (
                        "Ikke spesifisert"
                      )}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Telefonnummer</label>
                    <p>
                      {isEditing ? (
                        <div className="input-with-error">
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPhoneNumber(value);
                              validatePhoneNumber(value);
                            }}
                            placeholder="F.eks: +47 12345678"
                          />
                          {phoneError && (
                            <span className="error-message">{phoneError}</span>
                          )}
                        </div>
                      ) : (
                        phoneNumber || "Ikke spesifisert"
                      )}
                    </p>
                  </div>
                  <div className="info-item full-width">
                    <label>Helseproblemer</label>
                    <p>
                      {isEditing ? (
                        <textarea
                          value={healthIssues}
                          onChange={(e) => setHealthIssues(e.target.value)}
                          placeholder="Beskriv eventuelle helseproblemer her..."
                        />
                      ) : (
                        healthIssues || "Ingen spesifisert"
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="save-button-container">
                {isEditing && (
                  <button
                    className="action-button save"
                    onClick={handleSave}
                    disabled={
                      !!birthYearError ||
                      !!addressError ||
                      !!phoneError ||
                      isSaving
                    }
                  >
                    {isSaving ? "Lagrer..." : "Lagre endringer"}
                  </button>
                )}
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3>Kommende timer</h3>
                <button
                  className="section-toggle-btn"
                  onClick={() => setShowUpcoming((v) => !v)}
                >
                  {showUpcoming ? "Skjul" : "Vis"}
                </button>
              </div>
              {showUpcoming && (
                <div className="treatment-history">
                  {isLoading ? (
                    <p>Laster inn behandlinger...</p>
                  ) : upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking, index) => {
                      const treatmentName = getTreatmentName(
                        booking.treatmentId
                      );
                      return (
                        <div key={`up-${index}`} className="treatment-item">
                          <div className="treatment-info">
                            <h4>{treatmentName}</h4>
                            <p>
                              {formatDate(booking.date)} (
                              {formatTime(booking.timeslot.start)} -{" "}
                              {formatTime(booking.timeslot.end)})
                            </p>
                            <p>Varighet: {booking.duration} minutter</p>
                            <p>
                              Sted: {booking.location.address},{" "}
                              {booking.location.postalCode}{" "}
                              {booking.location.city}
                            </p>
                            <p>Pris: {booking.price} kr</p>
                          </div>
                          <div className="booking-actions">
                            <button
                              className="booking-action-btn danger"
                              onClick={() => openCancelModal(booking)}
                            >
                              Avbestill
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>Ingen kommende timer</p>
                  )}
                </div>
              )}
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3>Historikk</h3>
                <button
                  className="section-toggle-btn"
                  onClick={() => setShowHistory((v) => !v)}
                >
                  {showHistory ? "Skjul" : "Vis"}
                </button>
              </div>
              {showHistory && (
                <div className="treatment-history">
                  {isLoading ? (
                    <p>Laster inn behandlinger...</p>
                  ) : historyBookings.length > 0 ? (
                    historyBookings.map((booking, index) => {
                      const treatmentName = getTreatmentName(
                        booking.treatmentId
                      );
                      return (
                        <div key={`hist-${index}`} className="treatment-item">
                          <div className="treatment-info">
                            <h4>{treatmentName}</h4>
                            <p>
                              {formatDate(booking.date)} (
                              {formatTime(booking.timeslot.start)} -{" "}
                              {formatTime(booking.timeslot.end)})
                            </p>
                            <p>Varighet: {booking.duration} minutter</p>
                            <p>
                              Sted: {booking.location.address},{" "}
                              {booking.location.postalCode}{" "}
                              {booking.location.city}
                            </p>
                            <p>Pris: {booking.price} kr</p>
                            <p>Status: {booking.status}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>Ingen behandlinger i historikken</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {/* Cancel Booking Modal */}
      {showCancelBookingModal && bookingToCancel && (
        <div className="privacy-modal-overlay" onClick={closeCancelModal}>
          <div
            className="privacy-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="privacy-modal-header">
              <h3>Bekreft avbestilling</h3>
              <button
                className="privacy-modal-close"
                onClick={closeCancelModal}
              >
                ✕
              </button>
            </div>
            <div className="privacy-modal-body">
              <p>
                Er du sikker på at du vil avbestille timen{" "}
                {formatDate(bookingToCancel.date)} kl.{" "}
                {formatTime(bookingToCancel.timeslot.start)}?
              </p>
              {getCancellationWarning(bookingToCancel) && (
                <p className="error-message">
                  {getCancellationWarning(bookingToCancel)}
                </p>
              )}
              <p>
                Merk: Avbestillingsregler gjelder (24t - 100% / 48t - 50%
                gebyr).
              </p>
              <div className="privacy-buttons">
                <button
                  className="privacy-action-btn secondary"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Avbestiller..." : "Bekreft avbestilling"}
                </button>
                <button
                  className="privacy-action-btn tertiary"
                  onClick={closeCancelModal}
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule modal removed */}
      {showDeleteAccount && (
        <div
          className="delete-modal-overlay"
          onClick={() => setShowDeleteAccount(false)}
        >
          <div
            className="delete-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-header">
              <h3>🗑️ Slett min konto</h3>
              <button
                className="delete-modal-close"
                onClick={() => setShowDeleteAccount(false)}
              >
                ✕
              </button>
            </div>
            <div className="delete-modal-body">
              <DeleteAccount />
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div
          className="privacy-modal-overlay"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="privacy-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="privacy-modal-header">
              <h3>🛡️ Personvern og dine rettigheter</h3>
              <button
                className="privacy-modal-close"
                onClick={() => setShowPrivacyModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="privacy-modal-body">
              <div className="privacy-section">
                <h4>Dine personvernrettigheter</h4>
                <p>Som bruker av våre tjenester har du følgende rettigheter:</p>
                <ul>
                  <li>
                    <strong>Rett til innsyn:</strong> Du kan se alle
                    personopplysninger vi har om deg
                  </li>
                  <li>
                    <strong>Rett til korrigering:</strong> Du kan be oss rette
                    uriktige opplysninger
                  </li>
                  <li>
                    <strong>Rett til sletting:</strong> Du kan be om å få
                    opplysningene dine slettet
                  </li>
                  <li>
                    <strong>Rett til dataportabilitet:</strong> Du kan få en
                    kopi av dine data
                  </li>
                  <li>
                    <strong>Rett til å trekke tilbake samtykke:</strong> Du kan
                    når som helst trekke tilbake samtykket ditt
                  </li>
                </ul>
              </div>

              <div className="privacy-section">
                <h4>Hvilke data vi samler</h4>
                <ul>
                  <li>Kontaktinformasjon (navn, e-post, telefon)</li>
                  <li>Fødselsdato og kjønn</li>
                  <li>Helseinformasjon relatert til behandling</li>
                  <li>Adresse for hjemmebehandling</li>
                  <li>Bookinghistorikk og preferanser</li>
                </ul>
              </div>

              <div className="privacy-section">
                <h4>Hvordan vi bruker dataene</h4>
                <ul>
                  <li>Administrere dine bookinger og behandlinger</li>
                  <li>Kommunisere med deg om dine timer</li>
                  <li>Gi deg personlig tilpasset behandling</li>
                  <li>Forbedre våre tjenester</li>
                  <li>Overholde lovpålagte forpliktelser</li>
                </ul>
              </div>

              <div className="privacy-section">
                <h4>Lagring og sikkerhet</h4>
                <p>
                  Vi bruker Google Firebase som teknisk plattform for sikker
                  lagring av dine data. All data behandles i tråd med
                  GDPR-regelverket og Googles sikkerhets- og
                  personvernstandarder.
                </p>
                <p>
                  Helseopplysninger oppbevares i henhold til helsepersonellovens
                  krav om oppbevaring av pasientjournaler.
                </p>
              </div>

              <div className="privacy-section">
                <h4>Kontakt oss</h4>
                <p>
                  For spørsmål om personvern eller for å utøve dine rettigheter,
                  kontakt oss på:
                </p>
                <p>
                  <strong>E-post:</strong> post@knipetak.no
                  <br />
                  <strong>Telefon:</strong> +47 902 75 748
                  <br />
                  <strong>Adresse:</strong> Tobrotet 48, 5355 Knarrevik
                </p>
              </div>

              <div className="privacy-actions">
                <p>
                  <strong>Ønsker du å utøve dine rettigheter?</strong>
                </p>
                <div className="privacy-buttons">
                  <button
                    className="privacy-action-btn primary"
                    onClick={() => {
                      setShowPrivacyModal(false);
                      setShowDataExportModal(true);
                    }}
                  >
                    📥 Eksporter mine data
                  </button>
                  <button
                    className="privacy-action-btn secondary"
                    onClick={() => {
                      setShowPrivacyModal(false);
                      setShowDeleteAccount(true);
                    }}
                  >
                    🗑️ Slett min konto
                  </button>
                  <a
                    href="/privacy"
                    className="privacy-action-btn tertiary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📋 Les full personvernerklæring
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Export Modal */}
      {showDataExportModal && (
        <div
          className="data-export-modal-overlay"
          onClick={() => setShowDataExportModal(false)}
        >
          <div
            className="data-export-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="data-export-modal-header">
              <h3>📥 Eksporter mine data</h3>
              <button
                className="data-export-modal-close"
                onClick={() => setShowDataExportModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="data-export-modal-body">
              <DataExport />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
