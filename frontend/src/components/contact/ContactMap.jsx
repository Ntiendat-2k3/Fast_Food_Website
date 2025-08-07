const ContactMap = () => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-white">Bản Đồ</h3>
      <div className="w-full h-48 sm:h-64 bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.002329808928!2d105.82754847510525!3d21.03259278061769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135aba02050370d%3A0xe5f8aebedd731212!2zMTIzIFAuIFRy4bqnbiBQaMO6LCBLaW0gTcOjLCBCYSDEkMOsbmgsIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1754575127725!5m2!1svi!2s"
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
