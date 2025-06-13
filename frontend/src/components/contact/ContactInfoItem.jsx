const ContactInfoItem = ({ icon: Icon, title, content, delay = 0 }) => {
  return (
    <div className="flex items-start group">
      <div className="p-3 bg-yellow-400/20 rounded-xl mr-4 group-hover:bg-yellow-400/30 transition-colors">
        <Icon className="w-6 h-6 text-yellow-400" />
      </div>
      <div>
        <h3 className="font-medium text-white mb-1">{title}</h3>
        <p className="text-gray-300">{content}</p>
      </div>
    </div>
  )
}

export default ContactInfoItem
