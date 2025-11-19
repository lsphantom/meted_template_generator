import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Description as DocumentIcon,
  Folder as FolderIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import type { AssetFile } from '../types/lesson';

interface AssetsManagerProps {
  assets: AssetFile[];
  onChange: (assets: AssetFile[]) => void;
}

type FileType = 'image' | 'video' | 'audio' | 'document';

const fileTypeConfig = {
  image: {
    icon: ImageIcon,
    accept: 'image/*',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
    color: 'primary' as const
  },
  video: {
    icon: VideoIcon,
    accept: 'video/*',
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    color: 'secondary' as const
  },
  audio: {
    icon: AudioIcon,
    accept: 'audio/*',
    extensions: ['.mp3', '.wav', '.ogg', '.aac', '.flac'],
    color: 'success' as const
  },
  document: {
    icon: DocumentIcon,
    accept: '.pdf,.doc,.docx,.txt,.rtf',
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    color: 'warning' as const
  }
};

export default function AssetsManager({ assets, onChange }: AssetsManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    asset: AssetFile | null;
  }>({ open: false, asset: null });
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    asset: AssetFile | null;
    newName: string;
  }>({ open: false, asset: null, newName: '' });

  const getFileType = (fileName: string): FileType => {
    const extension = fileName.toLowerCase();
    
    for (const [type, config] of Object.entries(fileTypeConfig)) {
      if (config.extensions.some(ext => extension.endsWith(ext))) {
        return type as FileType;
      }
    }
    
    return 'document';
  };

  const generateAssetPath = (file: File, type: FileType): string => {
    return `assets/${type}s/${file.name}`;
  };

  const handleFileUpload = useCallback((files: FileList | File[]) => {
    setUploading(true);
    
    const fileArray = Array.from(files);
    const newAssets: AssetFile[] = [];

    fileArray.forEach((file) => {
      const type = getFileType(file.name);
      const asset: AssetFile = {
        id: uuidv4(),
        name: file.name,
        type,
        file,
        path: generateAssetPath(file, type)
      };
      newAssets.push(asset);
    });

    // Add new assets to existing ones
    const updatedAssets = [...assets, ...newAssets];
    onChange(updatedAssets);
    
    setTimeout(() => setUploading(false), 500);
  }, [assets, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    const updatedAssets = assets.filter(asset => asset.id !== assetId);
    onChange(updatedAssets);
  };

  const handlePreviewAsset = (asset: AssetFile) => {
    setPreviewDialog({ open: true, asset });
  };

  const handleRenameAsset = (asset: AssetFile) => {
    setRenameDialog({ 
      open: true, 
      asset, 
      newName: asset.name.replace(/\.[^/.]+$/, "") // Remove extension
    });
  };

  const handleRenameConfirm = () => {
    if (!renameDialog.asset || !renameDialog.newName.trim()) return;

    const fileExtension = renameDialog.asset.name.substring(
      renameDialog.asset.name.lastIndexOf('.')
    );
    const newFileName = renameDialog.newName.trim() + fileExtension;
    
    const updatedAssets = assets.map(asset =>
      asset.id === renameDialog.asset?.id
        ? { 
            ...asset, 
            name: newFileName,
            path: generateAssetPath({ name: newFileName } as File, asset.type)
          }
        : asset
    );
    
    onChange(updatedAssets);
    setRenameDialog({ open: false, asset: null, newName: '' });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAssetsByType = (type: FileType) => {
    return assets.filter(asset => asset.type === type);
  };

  const renderAssetPreview = (asset: AssetFile) => {
    if (asset.type === 'image') {
      const imageUrl = URL.createObjectURL(asset.file);
      return (
        <Box
          component="img"
          src={imageUrl}
          alt={asset.name}
          sx={{
            width: '100%',
            height: 200,
            objectFit: 'contain',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1
          }}
        />
      );
    }
    
    return (
      <Box
        sx={{
          width: '100%',
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'grey.50'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Preview not available for this file type
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 2 }}>
      <Card>
        <CardHeader
          title="Assets Manager"
          subheader={`Manage lesson assets (${assets.length} file${assets.length !== 1 ? 's' : ''})`}
        />
        <CardContent>
          {/* Upload Area */}
          <Paper
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: dragOver ? 'primary.main' : 'divider',
              backgroundColor: dragOver ? 'primary.50' : 'background.default',
              p: 4,
              textAlign: 'center',
              mb: 3,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              accept={Object.values(fileTypeConfig).map(config => config.accept).join(',')}
            />
            
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drop files here or click to upload
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports images, videos, audio files, and documents
            </Typography>
            
            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Uploading files...
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Supported File Types */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Supported formats:</strong> Images (JPG, PNG, GIF, SVG, WebP), 
              Videos (MP4, AVI, MOV, WebM), Audio (MP3, WAV, OGG, AAC), 
              Documents (PDF, DOC, DOCX, TXT, RTF)
            </Typography>
          </Alert>

          {/* Assets by Type */}
          {assets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FolderIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                No assets uploaded yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload some files to get started
              </Typography>
            </Box>
          ) : (
            <Box>
              {Object.entries(fileTypeConfig).map(([type, config]) => {
                const typeAssets = getAssetsByType(type as FileType);
                const IconComponent = config.icon;
                
                if (typeAssets.length === 0) return null;

                return (
                  <Box key={type} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <IconComponent sx={{ mr: 1, color: `${config.color}.main` }} />
                      <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                        {type}s ({typeAssets.length})
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {typeAssets.map((asset) => (
                        <Grid item xs={12} sm={6} md={4} key={asset.id}>
                          <Card variant="outlined">
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <IconComponent 
                                  sx={{ mr: 1, color: `${config.color}.main` }} 
                                />
                                <Chip
                                  size="small"
                                  label={type}
                                  color={config.color}
                                  variant="outlined"
                                />
                              </Box>
                              
                              <Typography
                                variant="subtitle2"
                                noWrap
                                title={asset.name}
                                sx={{ mb: 1 }}
                              >
                                {asset.name}
                              </Typography>
                              
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(asset.file.size)}
                              </Typography>
                            </CardContent>
                            
                            <CardActions size="small" sx={{ justifyContent: 'space-between' }}>
                              <Button
                                size="small"
                                startIcon={<PreviewIcon />}
                                onClick={() => handlePreviewAsset(asset)}
                              >
                                Preview
                              </Button>
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRenameAsset(asset)}
                                  title="Rename"
                                >
                                  <DocumentIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteAsset(asset.id)}
                                  title="Delete"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    
                    {type !== 'document' && <Divider sx={{ mt: 2 }} />}
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Asset Paths Reference */}
      {assets.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title="Asset Paths Reference"
            subheader="Use these paths in your lesson content"
          />
          <CardContent>
            <List dense>
              {assets.map((asset) => (
                <ListItem key={asset.id} divider>
                  <ListItemText
                    primary={asset.name}
                    secondary={`Path: ${asset.path}`}
                    secondaryTypographyProps={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem'
                    }}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      size="small"
                      label={asset.type}
                      color={fileTypeConfig[asset.type].color}
                      variant="outlined"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, asset: null })}
        maxWidth="md"
        fullWidth
      >
        {previewDialog.asset && (
          <>
            <DialogTitle>
              {previewDialog.asset.name}
            </DialogTitle>
            <DialogContent>
              {renderAssetPreview(previewDialog.asset)}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Size:</strong> {formatFileSize(previewDialog.asset.file.size)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Type:</strong> {previewDialog.asset.file.type || 'Unknown'}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace' }}
                >
                  <strong>Path:</strong> {previewDialog.asset.path}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewDialog({ open: false, asset: null })}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onClose={() => setRenameDialog({ open: false, asset: null, newName: '' })}
      >
        <DialogTitle>Rename Asset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="New file name"
            value={renameDialog.newName}
            onChange={(e) => setRenameDialog(prev => ({ ...prev, newName: e.target.value }))}
            sx={{ mt: 1 }}
          />
          {renameDialog.asset && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Extension: {renameDialog.asset.name.substring(renameDialog.asset.name.lastIndexOf('.'))}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialog({ open: false, asset: null, newName: '' })}>
            Cancel
          </Button>
          <Button 
            onClick={handleRenameConfirm}
            disabled={!renameDialog.newName.trim()}
            variant="contained"
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}