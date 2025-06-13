const ContactMap = () => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-white">Bản Đồ</h3>
      <div className="w-full h-48 sm:h-64 bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0381286064193!2d106.69908937469275!3d10.7287758896639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f7b7ed82f1d%3A0xd0c5bbf53a4b9502!2zMTIzIMSQxrDhu51uZyBOZ3V54buFbiBWxINuIExpbmgsIFTDom4gUGjDuSwgUXXhuq1uIDcsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1715512027!5m2!1svi!2s"
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
