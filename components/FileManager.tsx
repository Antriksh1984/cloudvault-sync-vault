'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileManagerProps {
  user: any
  showMessage: (text: string) => void
  setUser: (user: any) => void
}

export function FileManager({ user, showMessage, setUser }: FileManagerProps) {
  const [files, setFiles] = useState<string[]>([])
  const [folderName, setFolderName] = useState('')
  const [binFiles, setBinFiles] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // API call utility
  const apiCall = async (path: string, method = 'GET', options = {}) => {
    try {
      const { Auth, API } = await import('aws-amplify')
      const currentUser = await Auth.currentAuthenticatedUser()
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': currentUser.signInUserSession.idToken.jwtToken
      }
      const init = { headers, ...options }
      return await API.get('CV_v1', path, init)
    } catch (error: any) {
      showMessage(`API call failed: ${error.message}`)
      return null
    }
  }

  const fetchFiles = async () => {
    try {
      const response = await apiCall(`/file?action=list&user=${user.username}`)
      setFiles(response?.files || [])
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const fetchBinFiles = async () => {
    try {
      const response = await apiCall(`/file?action=list&user=${user.username}&prefix=bin`)
      setBinFiles(response?.files || [])
    } catch (error) {
      console.error('Error fetching bin files:', error)
    }
  }

  useEffect(() => {
    fetchFiles()
    fetchBinFiles()
  }, [user])

  const createFolder = async () => {
    if (!folderName.trim()) {
      showMessage('Please enter a folder name.')
      return
    }
    
    setIsLoading(true)
    try {
      await apiCall(`/file?action=create_folder&file=${encodeURIComponent(folderName)}`, 'POST')
      setFolderName('')
      await fetchFiles()
      showMessage('Folder created successfully!')
    } catch (error) {
      showMessage('Failed to create folder.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    setIsLoading(true)
    try {
      const { Storage } = await import('aws-amplify')
      const uploadPromises = acceptedFiles.map(file => {
        const filePath = (file as any).webkitRelativePath || file.name
        return Storage.put(`public/${user.username}/${filePath}`, file, {
          contentType: file.type
        })
      })
      
      await Promise.all(uploadPromises)
      showMessage(`${acceptedFiles.length} file(s) uploaded successfully.`)
      await fetchFiles()
    } catch (error: any) {
      showMessage(`Upload failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [user, showMessage])

  const handleDownload = async (fileKey: string) => {
    try {
      const response = await apiCall(`/file?action=get_file&file=${encodeURIComponent(fileKey)}&user=${user.username}`)
      if (response && response.url) {
        const link = document.createElement('a')
        link.href = response.url
        link.download = fileKey.split('/').pop() || fileKey
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showMessage('Download started.')
      } else {
        showMessage('Failed to get download URL.')
      }
    } catch (error) {
      showMessage('Download failed.')
    }
  }

  const handleMultipleDownload = async () => {
    if (selectedFiles.length === 0) {
      showMessage('Please select files to download.')
      return
    }

    setIsLoading(true)
    try {
      // Dynamic import for JSZip
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      const fetchPromises = selectedFiles.map(async fileKey => {
        const response = await apiCall(`/file?action=get_file&file=${encodeURIComponent(fileKey)}&user=${user.username}`)
        if (response && response.url) {
          const urlResponse = await fetch(response.url)
          const blob = await urlResponse.blob()
          zip.file(fileKey.split('/').pop() || fileKey, blob)
        } else {
          throw new Error(`Failed to get URL for ${fileKey}`)
        }
      })

      await Promise.all(fetchPromises)
      const content = await zip.generateAsync({ type: 'blob' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = 'CloudVault_Download.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showMessage('Selected files downloaded as ZIP.')
      setSelectedFiles([])
    } catch (error: any) {
      showMessage(`Download failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const moveToBin = async (fileKey: string) => {
    setIsLoading(true)
    try {
      await apiCall(`/bin?action=move_to_bin&file=${encodeURIComponent(fileKey)}`, 'POST')
      await fetchFiles()
      await fetchBinFiles()
      showMessage('File moved to bin.')
    } catch (error) {
      showMessage('Failed to move file to bin.')
    } finally {
      setIsLoading(false)
    }
  }

  const restoreFromBin = async (fileKey: string) => {
    setIsLoading(true)
    try {
      await apiCall(`/bin?action=restore_from_bin&file=${encodeURIComponent(fileKey)}`, 'POST')
      await fetchFiles()
      await fetchBinFiles()
      showMessage('File restored from bin.')
    } catch (error) {
      showMessage('Failed to restore file.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { Auth } = await import('aws-amplify')
      await Auth.signOut()
      setUser(null)
      showMessage('Signed out successfully.')
    } catch (error: any) {
      showMessage(`Error signing out: ${error.message}`)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: handleUpload,
    disabled: isLoading
  })

  const toggleFileSelection = (file: string) => {
    setSelectedFiles(prev => 
      prev.includes(file) 
        ? prev.filter(f => f !== file)
        : [...prev, file]
    )
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-xl max-w-7xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">CloudVault File Manager</h2>
        <button 
          onClick={handleSignOut} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          disabled={isLoading}
        >
          Sign Out
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Files Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Files</h3>
          
          {/* Create Folder */}
          <div className="mb-4 flex space-x-2">
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="New Folder Name"
              className="p-2 border border-gray-300 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button 
              onClick={createFolder} 
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading || !folderName.trim()}
            >
              Create Folder
            </button>
          </div>
          
          {/* Upload Area */}
          <div 
            {...getRootProps()} 
            className={`mt-2 border-2 border-dashed p-6 rounded-xl text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-500">
              {isDragActive 
                ? 'Drop the files here...' 
                : "Drag 'n' drop files or folders here, or click to select them."
              }
            </p>
          </div>
          
          {/* Files List */}
          <div className="mt-4">
            {files.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm">
                    <label className="flex items-center text-gray-800 flex-grow cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file)}
                        onChange={() => toggleFileSelection(file)}
                        className="mr-3"
                        disabled={isLoading}
                      />
                      <span className="truncate">{file}</span>
                    </label>
                    <div className="flex space-x-2 ml-2">
                      <button 
                        onClick={() => handleDownload(file)} 
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                        disabled={isLoading}
                      >
                        Download
                      </button>
                      <button 
                        onClick={() => moveToBin(file)} 
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Download Selected Button */}
          <button 
            onClick={handleMultipleDownload} 
            className="mt-4 w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            disabled={isLoading || selectedFiles.length === 0}
          >
            Download Selected ({selectedFiles.length})
          </button>
        </div>

        {/* Bin Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Bin</h3>
          {binFiles.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Bin is empty.</p>
          ) : (
            <ul className="space-y-2">
              {binFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm">
                  <span className="text-gray-800 truncate flex-grow">{file}</span>
                  <button 
                    onClick={() => restoreFromBin(file)} 
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors text-sm disabled:opacity-50 ml-2"
                    disabled={isLoading}
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-500 mt-4">
            Files in bin are automatically deleted after 30 days.
          </p>
        </div>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
