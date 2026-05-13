import { ChevronDown, Share2 } from 'lucide-react'
import './CareDemoHelpModal.css'

const HELP_GETTING_STARTED_IMAGE = `${import.meta.env.BASE_URL}care-demo/help-getting-started-panel.png`
const HELP_SKYPORT_ACTION_PROMO_IMAGE = `${import.meta.env.BASE_URL}care-demo/skyportcare-in-action-promo.png`

const CARE_DEMO_HELP_ACTION = [
  'Adjusting Blower Trim',
  'Heater Kit Set-Up',
  'Setting CFM Speed Taps',
  'Adjusting Target Humidity',
  'Setting Heat Pump Lockout',
  'Adjusting Dehumidification Profiles',
  'Setting Up a Humidifier Relay',
  'Configuring Auxiliary Heat Sources',
  'Enable / Disable Large Font Setting',
]

/** Single ordered FAQ list (expand/collapse); answers match product-style copy. */
const CARE_DEMO_HELP_FAQ_ALL = [
  {
    q: 'How do I learn more?',
    a: 'Talk to your Daikin sales representative.',
  },
  {
    q: 'What if the homeowner moves? Is Cloud Services transferrable?',
    a: 'Cloud Services is tied to the outdoor equipment installed at a specific address, so if a homeowner moves, the license can transfer to up to two new owners. This requires the license to be active, and the new owner to accept an invitation from a dealer to connect to their system’s data. This is another great way to build a relationship with a new customer.',
  },
  {
    q: 'Why do you charge for Cloud Services?',
    a: 'There is a cost associated with developing a cloud-service like this as well as ongoing costs to support it. This is true regardless of who offers it. Rolling that cost into other equipment prices simply means that everyone who buys that equipment is paying for that service, whether they utilize it or not. Daikin One Cloud Services is a unique business solution that can help a contractor grow their business, generate new incremental revenue, and build closer relationships with their customers. We don’t think there are any other solutions that have all the capabilities of Cloud Services. Cloud Services creates value for the contractor.',
  },
  {
    q: 'Is there a cost for Cloud Services? How do I purchase it? How long is it good for?',
    a: 'Yes, Cloud Services licenses are offered as either 1-year or Lifetime licenses. The first year of Cloud Services is included with Daikin One Smart Thermostats, and to let every Daikin dealer take Cloud Services for a "test drive", you may invite your first two customers to sign up for Lifetime licenses at no charge. Licenses may be purchased through the Cloud Services web portal using a credit card or through Warranty Express.',
  },
  {
    q: "How secure is my company's and my customers' data?",
    a: (
      <>
        We use reasonable administrative, physical, and technological security measures to safeguard your company and customer information against theft or other unauthorized access, use, or modification. And we require relevant third parties to, through contracts, do the same. The security measures we use are designed to provide a level of security appropriate to that information. See our{' '}
        <a
          className="care-demo-help__link"
          href="https://daikincomfort.com/privacy-notice"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        .
      </>
    ),
  },
  {
    q: 'How do I tell my customers (homeowners) about Cloud Services?',
    a: 'Homeowners will appreciate the peace of mind they get from knowing that you can check on their system status 24/7/365, and in many cases, make system adjustments remotely, providing them with "contactless service". Daikin has provided a customer invitation email that includes homeowner benefits, within the Cloud Services portal, that can be customized with your company’s logo and name to offer a more personalized invitation.',
  },
  {
    q: 'How can Cloud Services help me grow my business?',
    a: 'By seeing how your customers’ systems are used and how they are performing, you can increase the value of the service you provide by recommending equipment upgrades, accessories, and services. You can also help your company stand out by offering higher levels of service than your competition, as well as build closer relationships with your customers.',
  },
  {
    q: 'Can I take Cloud Services for a "test drive"?',
    a: 'Absolutely! Once you’ve registered your business, you can connect to and view new installations with Daikin Smart thermostats. The first two systems you connect to receive Lifetime licenses at no charge.',
  },
  {
    q: 'How do I get started with Daikin One Cloud Services?',
    a: 'There is no charge or obligation for current Daikin Comfort Pros to register for Cloud Services. Simply click on the registration link above, confirm some information about your company, and you’re ready to start setting up your account and inviting customers.',
  },
  {
    q: 'Will Daikin be marketing directly to homeowners? Is Daikin trying to take the DCPs customers?',
    a: 'The intent of Daikin One Cloud Services is to help Daikin dealers grow their business in several ways, including building longterm loyalty between the homeowner and dealer. From time-to-time Daikin may send emails to the homeowner, communicating new features that we introduce to improve their user experience with the Daikin One Home app and Smart Thermostat. These emails will always encourage the homeowner to contact their dealer directly with questions, concerns, or for assistance.',
  },
  {
    q: 'Does the homeowner have an option to opt-out of any direct-to-consumer marketing?',
    a: 'The Homeowner can easily choose "unsubscribe" as an option at the bottom of emails which Daikin sends and they will no longer receive emails from Daikin One Cloud Services.',
  },
  {
    q: 'What data is Daikin collecting and what is it used for?',
    a: 'The only data that is collected is about Daikin HVAC system performance and usage, there is no tracking or monitoring of homeowners’ behavior other than system settings. This data is shared with the Daikin dealer through the Daikin One Cloud Services portal and app if/when a homeowner agrees. The data may also be consolidated for analysis by Daikin to improve system design and performance. Data collected requires homeowner approval within the terms and conditions listed in the app and on our websites.',
  },
  {
    q: 'Will my data be sold?',
    a: 'Daikin will not sell this data to any third party.',
  },
  {
    q: 'Is my thermostat listening to me or tracking me (like Alexa or Nest)?',
    a: 'No. Our Smart Thermostats do not contain any tracking sensors, specifically they do not contain microphones or cameras. In the future, motion or occupancy sensors may be added to improve system control and comfort in the home.',
  },
]

function CareDemoHelpVideoCard({ title }) {
  const alt = `Reducing truck rolls with Daikin One Cloud Services — ${title}`
  return (
    <article className="care-demo-help__card care-demo-help__card--action-promo" aria-label={alt}>
      <div className="care-demo-help__thumb care-demo-help__thumb--action-promo">
        <img
          className="care-demo-help__thumb-img"
          src={HELP_SKYPORT_ACTION_PROMO_IMAGE}
          alt=""
          width={1024}
          height={576}
          decoding="async"
          loading="lazy"
        />
        <p className="care-demo-help__thumb-subtitle">{title}</p>
      </div>
      <div className="care-demo-help__card-foot">
        <span className="care-demo-help__card-title">{title}</span>
        <span className="care-demo-help__share">
          Share video
          <Share2 size={13} strokeWidth={2} className="care-demo-help__share-ic" aria-hidden />
        </span>
      </div>
    </article>
  )
}

function FaqAnswer({ children }) {
  return <div className="care-demo-help__faq-body">{children}</div>
}

/**
 * Shared Help body (Getting Started, SkyportCare in Action + FAQ + Support).
 * @param {{ variant?: 'page' | 'modal' }} props
 */
export default function CareDemoHelpContent({ variant = 'modal' }) {
  const isPage = variant === 'page'

  const inner = (
    <>
      <section className="care-demo-help__section care-demo-help__section--getting-started-panel" aria-label="Getting Started video tutorials">
        <div className="care-demo-help__getting-started-shell">
          <img
            className="care-demo-help__getting-started-img"
            src={HELP_GETTING_STARTED_IMAGE}
            alt="Getting Started: twelve tutorial videos in a grid — Adding Team Members, Adding Customers, Dashboard Overview, Alerts, Remote Login, Performance Charts, Report Overview, Report Creation, Customers Screen, Locations Screen, Credit Card Purchase, Purchase with Warranty Express. Each card shows a thumbnail and Share video."
            width={901}
            height={1024}
            decoding="async"
            loading="lazy"
          />
        </div>
      </section>

      <section className="care-demo-help__section care-demo-help__section--skyport-action" aria-labelledby="care-demo-help-action-title">
        <h2 id="care-demo-help-action-title" className="care-demo-help__h2 care-demo-help__h2--action">
          SkyportCare in Action
        </h2>
        <p className="care-demo-help__lead">Reducing installation-related callbacks with Remote Access.</p>
        <div className="care-demo-help__grid care-demo-help__grid--action">
          {CARE_DEMO_HELP_ACTION.map((title) => (
            <CareDemoHelpVideoCard key={title} title={title} />
          ))}
        </div>

        <h2 className="care-demo-help__h2 care-demo-help__h2--faq-block">FAQ</h2>
        <div className="care-demo-help__faq-wrap care-demo-help__faq-wrap--shadow">
          {CARE_DEMO_HELP_FAQ_ALL.map(({ q, a }) => (
            <details key={q} className="care-demo-help__faq">
              <summary className="care-demo-help__faq-sum">
                <ChevronDown className="care-demo-help__faq-chev" size={16} strokeWidth={2} aria-hidden />
                {q}
              </summary>
              <FaqAnswer>{a}</FaqAnswer>
            </details>
          ))}
        </div>

        <div className="care-demo-help__support care-demo-help__support--shadow">
          <h2 className="care-demo-help__support-title">Support</h2>
          <p className="care-demo-help__support-text">
            For support with the Dealer Program call{' '}
            <a className="care-demo-help__link" href="tel:18553245461">
              1-855-324-5461
            </a>
            . Or send an email to{' '}
            <a className="care-demo-help__link" href="mailto:support@skyportcare-demo.example">
              support@skyportcare-demo.example
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )

  if (isPage) {
    return (
      <div className="care-demo-help-page">
        <h1 className="care-demo__view-title care-demo-help-page__title">Help</h1>
        <div className="care-demo-help-page__inner">{inner}</div>
      </div>
    )
  }

  return inner
}
