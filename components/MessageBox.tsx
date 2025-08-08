interface MessageBoxProps {
  text: string
  onClose: () => void
}

export function MessageBox({ text, onClose }: MessageBoxProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="p-8 border w-96 shadow-lg rounded-md bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">Notification</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-lg text-gray-500">{text}</p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
