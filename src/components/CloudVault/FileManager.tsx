import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import cloudHero from '@/assets/cloud-hero.jpg';
import {
  Cloud,
  Upload,
  Download,
  Trash2,
  FolderPlus,
  RotateCcw,
  LogOut,
  File,
  Folder,
  Archive
} from 'lucide-react';

// Declare global AWS types
declare global {
  interface Window {
    AWS: any;
  }
}

// AWS SDK configuration - exactly like your original
const configureAWS = () => {
  if (typeof window !== 'undefined' && window.AWS) {
    const { Amplify, Auth, Storage, API } = window.AWS;
    
    Amplify.configure({
      Auth: {
        region: 'ap-south-1', 
        userPoolId: 'ap-south-1_y4GGRCtdR',
        userPoolWebClientId: '3thf1uf9n8bc7u0sogqv0bjrts',
        authenticationFlowType: 'USER_PASSWORD_AUTH'
      },
      Storage: {
        region: 'ap-south-1',
        bucket: 'adler-personal-storage',
        identityPoolId: 'ap-south-1:ce4fa149-520e-44b6-a006-128b8ef30c1b'
      },
      API: {
        endpoints: [
          {
            name: 'CV_v1',
            endpoint: 'https://necll2p9x2.execute-api.ap-south-1.amazonaws.com/Production',
            region: 'ap-south-1'
          }
        ]
      }
    });
    
    return { Auth, Storage, API };
  }
  return null;
};

const FileManager = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [folderName, setFolderName] = useState('');
  const [binFiles, setBinFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [awsServices, setAwsServices] = useState<any>(null);

  useEffect(() => {
    // Load AWS SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1286.0.min.js';
    script.onload = () => {
      const services = configureAWS();
      setAwsServices(services);
      if (services) {
        checkUser(services.Auth);
        fetchFiles(services);
        fetchBinFiles(services);
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const checkUser = async (Auth: any) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
    } catch (error) {
      console.log('No authenticated user');
    }
  };

  // API call utility exactly like your original
  const apiCall = async (path: string, method = 'GET', options = {}) => {
    if (!awsServices) return null;
    
    try {
      const user = await awsServices.Auth.currentAuthenticatedUser();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': user.signInUserSession.idToken.jwtToken
      };
      const init = { headers, ...options };
      return await awsServices.API.get('CV_v1', path, init);
    } catch (error: any) {
      toast({
        title: "API Error",
        description: `API call failed: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchFiles = async (services?: any) => {
    const aws = services || awsServices;
    if (!aws) return;
    
    try {
      const user = await aws.Auth.currentAuthenticatedUser();
      const response = await apiCall(`/file?action=list&user=${user.username}`);
      setFiles(response?.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const fetchBinFiles = async (services?: any) => {
    const aws = services || awsServices;
    if (!aws) return;
    
    try {
      const user = await aws.Auth.currentAuthenticatedUser();
      const response = await apiCall(`/file?action=list&user=${user.username}&prefix=bin`);
      setBinFiles(response?.files || []);
    } catch (error) {
      console.error('Failed to fetch bin files:', error);
    }
  };

  const createFolder = async () => {
    if (!folderName.trim() || !awsServices) return;
    
    try {
      await apiCall(`/file?action=create_folder&file=${folderName}`, 'POST');
      toast({
        title: "Success",
        description: `Folder "${folderName}" created successfully!`,
      });
      setFolderName('');
      fetchFiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create folder: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (acceptedFiles: File[]) => {
    if (!awsServices) return;
    
    try {
      const user = await awsServices.Auth.currentAuthenticatedUser();
      const uploadPromises = acceptedFiles.map(file => {
        const filePath = file.webkitRelativePath || file.name;
        return awsServices.Storage.put(`public/${user.username}/${filePath}`, file);
      });
      await Promise.all(uploadPromises);
      toast({
        title: "Success",
        description: "Files uploaded successfully!",
      });
      fetchFiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Upload failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (fileKey: string) => {
    if (!awsServices) return;
    
    try {
      const user = await awsServices.Auth.currentAuthenticatedUser();
      const response = await apiCall(`/file?action=get_file&file=${fileKey}&user=${user.username}`);
      if (response && response.url) {
        const link = document.createElement('a');
        link.href = response.url;
        link.download = fileKey;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Success",
          description: "File downloaded successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to get download URL.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Download failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleMultipleDownload = async () => {
    if (selectedFiles.length === 0 || !awsServices) {
      toast({
        title: "No Files Selected",
        description: "Please select files to download.",
        variant: "destructive",
      });
      return;
    }

    const zip = new JSZip();
    const fetchPromises = selectedFiles.map(async fileKey => {
      try {
        const user = await awsServices.Auth.currentAuthenticatedUser();
        const response = await apiCall(`/file?action=get_file&file=${fileKey}&user=${user.username}`);
        if (response && response.url) {
          const urlResponse = await fetch(response.url);
          const blob = await urlResponse.blob();
          zip.file(fileKey, blob);
        } else {
          throw new Error(`Failed to get URL for ${fileKey}`);
        }
      } catch (error) {
        console.error(`Error downloading ${fileKey}:`, error);
      }
    });

    try {
      await Promise.all(fetchPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'CloudVault_Download.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Success",
        description: "Selected files downloaded in a zip file!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Download failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const moveToBin = async (fileKey: string) => {
    try {
      await apiCall(`/bin?action=move_to_bin&file=${fileKey}`, 'POST');
      toast({
        title: "Success",
        description: "File moved to bin!",
      });
      fetchFiles();
      fetchBinFiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to move file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const restoreFromBin = async (fileKey: string) => {
    try {
      await apiCall(`/bin?action=restore_from_bin&file=${fileKey}`, 'POST');
      toast({
        title: "Success",
        description: "File restored from bin!",
      });
      fetchFiles();
      fetchBinFiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to restore file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    if (!awsServices) return;
    
    try {
      await awsServices.Auth.signOut();
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error signing out: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: handleUpload,
    multiple: true
  });

  if (!awsServices) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: `linear-gradient(135deg, rgba(54, 159, 245, 0.9), rgba(57, 177, 144, 0.9)), url(${cloudHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading AWS services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(135deg, rgba(54, 159, 245, 0.9), rgba(57, 177, 144, 0.9)), url(${cloudHero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="glass-morphism border-white/20 shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 cloud-gradient rounded-lg">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    CloudVault File Manager
                  </CardTitle>
                  <p className="text-sm text-white/80">Welcome back, {user?.username || 'User'}</p>
                </div>
              </div>
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className="border-white/30 hover:bg-white/10 text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Files Section */}
          <Card className="glass-morphism border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Folder className="h-5 w-5" />
                Your Files ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create Folder */}
              <div className="flex gap-2">
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="New folder name"
                  className="bg-white/50 border-white/30 text-gray-800"
                />
                <Button 
                  onClick={createFolder} 
                  size="sm" 
                  className="cloud-gradient hover:opacity-90"
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </div>

              {/* Upload Area */}
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/30 bg-white/5 hover:bg-white/10'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-white" />
                <p className="text-sm text-white/90">
                  {isDragActive 
                    ? 'Drop files here...' 
                    : 'Drag & drop files or click to select'
                  }
                </p>
              </div>

              {/* Files List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedFiles.includes(file)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFiles([...selectedFiles, file]);
                          } else {
                            setSelectedFiles(selectedFiles.filter(f => f !== file));
                          }
                        }}
                      />
                      <File className="h-4 w-4 text-white flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-white">{file}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleDownload(file)} 
                        size="sm" 
                        variant="outline"
                        className="border-white/30 hover:bg-white/10 text-white"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        onClick={() => moveToBin(file)} 
                        size="sm" 
                        variant="outline"
                        className="border-red-300/30 hover:bg-red-500/10 text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="text-center py-8 text-white/70">
                    <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No files uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Download Selected */}
              <Button 
                onClick={handleMultipleDownload} 
                className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                disabled={selectedFiles.length === 0}
              >
                <Archive className="h-4 w-4 mr-2" />
                Download Selected ({selectedFiles.length})
              </Button>
            </CardContent>
          </Card>

          {/* Bin Section */}
          <Card className="glass-morphism border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trash2 className="h-5 w-5" />
                Recycle Bin ({binFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {binFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50/10 rounded-lg border border-red-200/20">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-white">{file}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => restoreFromBin(file)} 
                      size="sm" 
                      variant="outline"
                      className="border-yellow-300/30 hover:bg-yellow-500/10 text-yellow-300"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {binFiles.length === 0 && (
                  <div className="text-center py-8 text-white/70">
                    <Trash2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Recycle bin is empty</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileManager;