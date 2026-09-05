import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_APIKEY,
  "Content-Type": "application/json",
};

export default function EventPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submissionState, setSubmissionState] = useState("");

  useEffect(() => {
    async function getEvent() {
      const response = await fetch(
        `${SUPABASE_URL}/events?select=*,venue:venues(*)&id=eq.${eventId}`,
        { headers },
      );
      const data = await response.json();
      setEvent(data[0]);
    }

    getEvent();
  }, [eventId]);

  async function handleSubmit(eventSubmit) {
    eventSubmit.preventDefault();
    setSubmissionState("submitting");

    try {
      const response = await fetch(`${SUPABASE_URL}/registrations`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name,
          email,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.venue.venueName,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration could not be saved");
      }

      setName("");
      setEmail("");
      setSubmissionState("success");
    } catch {
      setSubmissionState("error");
    }
  }

  if (!event) {
    return null;
  }

  const date = new Date(event.date);

  return (
    <>
      <main className="event-page">
        <Link className="back-link" to="/">
          ← Alle events
        </Link>

        <section className="event-detail">
          <img src={event.image} alt="" />
          <div className="event-detail-content">
            <p className="event-category">{event.category}</p>
            <h1>{event.title}</h1>
            <p className="lead">{event.summary}</p>
            <div className="detail-list">
              <p>
                <strong>Dato</strong>
                {date.toLocaleDateString("da-DK", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                kl.{" "}
                {date.toLocaleTimeString("da-DK", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <strong>Sted</strong>
                <span>
                  {event.venue.venueName}
                  <br />
                  {event.venue.venueAddress}, {event.venue.venuePostCode}{" "}
                  {event.venue.venueCity}
                  {event.venue.venueWebsite && (
                    <>
                      <br />
                      <a href={event.venue.venueWebsite}>Besøg hjemmeside</a>
                    </>
                  )}
                </span>
              </p>
              <p>
                <strong>Pris</strong>
                {event.price === 0 ? "Gratis" : `${event.price} kr.`}
              </p>
            </div>
            <p>{event.description}</p>
          </div>
        </section>

        <section className="signup-panel">
          <div>
            <p className="eyebrow dark">Tilmelding</p>
            <h2>Reserver din plads</h2>
            <p>
              Udfyld formularen, så sender vi din tilmelding til arrangøren.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <span>Navn</span>
            <input
              required
              name="name"
              value={name}
              onChange={(inputEvent) => setName(inputEvent.target.value)}
              placeholder="Dit navn"
            />

            <span>E-mail</span>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(inputEvent) => setEmail(inputEvent.target.value)}
              placeholder="dig@example.com"
            />
            <button type="submit" disabled={submissionState === "submitting"}>
              {submissionState === "submitting" ? "Sender..." : "Tilmeld mig"}
            </button>
            {submissionState === "success" && (
              <p className="form-message" role="status">
                Tak for din tilmelding.
              </p>
            )}
            {submissionState === "error" && (
              <p className="form-message" role="alert">
                Din tilmelding kunne ikke gemmes. Prøv igen.
              </p>
            )}
          </form>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-intro">
            <p className="footer-brand">
              mellemrum<span>.</span>
            </p>
            <p>Udvalgte kulturoplevelser og nye perspektiver på Aarhus.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <div className="footer-link-group">
              <p className="footer-heading">Udforsk</p>
              <Link to="/">Events</Link>
              <Link to="/om">Om Mellemrum</Link>
            </div>
            <div className="footer-link-group">
              <p className="footer-heading">For arrangører</p>
              <Link to="/tilmeldinger">Se tilmeldinger</Link>
              <a href="mailto:hej@mellemrum.dk">Kontakt os</a>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="footer-meta">© 2025 Mellemrum</p>
          <p>Aarhus, Danmark</p>
        </div>
      </footer>
    </>
  );
}
