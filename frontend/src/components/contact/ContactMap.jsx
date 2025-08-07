const ContactMap = () => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-white">Bản Đồ</h3>
      <div className="w-full h-48 sm:h-64 bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.417979243411!2d105.81301857510367!3d20.97587588066028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135acef8ad5350f%3A0x89435a3528118ff5!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBUaMSDbmcgTG9uZw!5e0!3m2!1svi!2s!4v1754582379908!5m2!1svi!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

      </div>
    </div>
  )
}

export default ContactMap
