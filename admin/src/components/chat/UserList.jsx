"use client"
import { Search } from "lucide-react"

const UserList = ({ users, selectedUser, onSelectUser, searchTerm, onSearchChange }) => {
  const filteredUsers = users.filter((user) => user.userName.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className="w-full bg-gray-800 text-white p-2 pl-8 rounded-md"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-56px)]">
        {filteredUsers.length === 0 ? (
          <div className="text-center text-gray-400 p-4">Không có người dùng nào</div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 ${
                selectedUser && selectedUser._id === user._id ? "bg-gray-800" : ""
              }`}
              onClick={() => onSelectUser(user)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{user.userName}</div>
                  <div className="text-xs text-gray-400">{new Date(user.lastMessage).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default UserList
