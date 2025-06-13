"use client"

const ContactInfoCard = ({ icon, title, content }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all duration-300 border border-slate-700 hover:border-yellow-400/50 group">
      <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-300">{content}</p>
    </div>
  )
}

export default ContactInfoCard
