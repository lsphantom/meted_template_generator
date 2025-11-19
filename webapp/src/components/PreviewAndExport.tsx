import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  Preview as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  Code as CodeIcon,
  Image as ImageIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { generateLessonPackage, downloadLessonPackage } from '../utils/lessonGenerator';
import type { LessonConfig, AssetFile } from '../types/lesson';

interface PreviewAndExportProps {
  config: LessonConfig;
  assets: AssetFile[];
}

export default function PreviewAndExport({ config, assets }: PreviewAndExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    content: string;
    title: string;
  }>({ open: false, content: '', title: '' });
  const [expandedPanel, setExpandedPanel] = useState<string>('summary');

  const handleGenerateAndDownload = async () => {
    try {
      setIsGenerating(true);
      await downloadLessonPackage(config, assets);
    } catch (error) {
      console.error('Error generating lesson package:', error);
      alert('Failed to generate lesson package. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async (type: 'config' | 'structure') => {
    let content = '';
    let title = '';

    if (type === 'config') {
      title = 'Lesson Configuration';
      content = JSON.stringify(config, null, 2);
    } else if (type === 'structure') {
      title = 'Generated File Structure';
      content = generateFileStructurePreview();
    }

    setPreviewDialog({ open: true, content, title });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateFileStructurePreview = () => {
    const structure = [
      'lesson-package/',
      '├── index.htm',
      '├── pageTemplate.php',
      '├── download.php',
      '├── print.php',
      '├── navmenu.inc.php',
      '├── README.md',
      '├── css/',
      '│   ├── module-custom.css',
    ];

    if (config.useBootstrap) {
      structure.push('│   ├── bootstrap.min.css');
    }

    structure.push('├── assets/');

    // Add asset folders based on uploaded assets
    const assetTypes = [...new Set(assets.map(asset => asset.type))];
    assetTypes.forEach((type, index) => {
      const isLast = index === assetTypes.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      structure.push(`│   ${connector}${type}s/`);
      
      const typeAssets = assets.filter(asset => asset.type === type);
      typeAssets.forEach((asset, assetIndex) => {
        const assetIsLast = assetIndex === typeAssets.length - 1;
        const assetConnector = isLast 
          ? (assetIsLast ? '    └── ' : '    ├── ')
          : (assetIsLast ? '│   └── ' : '│   ├── ');
        structure.push(`│   ${assetConnector}${asset.name}`);
      });
    });

    // Add content pages
    config.pages.forEach((page, index) => {
      structure.push(`├── page${index + 1}.htm`);
    });

    // Add optional pages
    if (config.includeQuiz) structure.push('├── quiz.htm');
    if (config.includePreassessment) structure.push('├── preassessment.htm');
    if (config.includeSurvey) structure.push('├── survey.htm');
    if (config.includeResources) structure.push('├── resources.htm');
    if (config.includeContributors) structure.push('└── contributors.htm');

    if (config.useBootstrap) {
      structure.push('└── js/');
      structure.push('    └── bootstrap.min.js');
    }

    return structure.join('\n');
  };

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? panel : '');
  };

  const getValidationErrors = () => {
    const errors = [];
    
    if (!config.lessonTitle.trim()) errors.push('Lesson title is required');
    if (config.pages.length === 0) errors.push('At least one content page is required');
    
    return errors;
  };

  const validationErrors = getValidationErrors();
  const isValid = validationErrors.length === 0;

  const fileStats = {
    totalFiles: 1 + config.pages.length + assets.length + 
                (config.includeQuiz ? 1 : 0) +
                (config.includePreassessment ? 1 : 0) +
                (config.includeSurvey ? 1 : 0) +
                (config.includeResources ? 1 : 0) +
                (config.includeContributors ? 1 : 0) + 3, // base files
    htmlFiles: 1 + config.pages.length + 
               (config.includeQuiz ? 1 : 0) +
               (config.includePreassessment ? 1 : 0) +
               (config.includeSurvey ? 1 : 0) +
               (config.includeResources ? 1 : 0) +
               (config.includeContributors ? 1 : 0),
    phpFiles: 3, // pageTemplate.php, download.php, print.php
    cssFiles: 1 + (config.useBootstrap ? 1 : 0),
    assets: assets.length
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 2 }}>
      {/* Validation Status */}
      {!isValid && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Please fix the following issues before generating:
          </Typography>
          <List dense>
            {validationErrors.map((error, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <Typography variant="body2">• {error}</Typography>
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      <Card>
        <CardHeader
          title="Preview and Export"
          subheader="Review your lesson configuration and generate the final package"
          action={
            <Button
              variant="contained"
              size="large"
              startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={handleGenerateAndDownload}
              disabled={!isValid || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Download Package'}
            </Button>
          }
        />
        
        <CardContent>
          {/* Lesson Summary */}
          <Accordion 
            expanded={expandedPanel === 'summary'} 
            onChange={handleAccordionChange('summary')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                <Typography variant="h6">Lesson Summary</Typography>
                <Chip label={isValid ? 'Ready' : 'Issues Found'} color={isValid ? 'success' : 'error'} size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={0}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Basic Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Title"
                        secondary={config.lessonTitle || 'Not set'}
                      />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Lesson ID"
                            secondary={config.lessonId || 'Not set'}
                        />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Language"
                        secondary={config.language || 'Not set'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Description"
                        secondary={config.description || 'Not set'}
                      />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="MetEd Path"
                            secondary={config.metedPath || 'Not set'}
                        />
                    </ListItem> 
                    <ListItem>
                      <ListItemText
                        primary="Keywords"
                        secondary={config.keywords || 'Not set'}
                      />
                    </ListItem>
                  </List>

                  <List dense>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                        Additional Settings
                    </Typography>
                    <ListItem>
                        <ListItemText
                            primary="Copyright Year Field"
                            secondary={config.customCopyrightYear || 'Default: Current Year'}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Cover Image Credit"
                            secondary={config.customCoverImageCredit || 'Default: None'}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Uses Narrated Text Switch"
                            secondary={config.includeNarratedTextSwitch ? 'Yes' : 'No'}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Includes Additional Top-Level Pages"
                            secondary={config.includeAdditionalTopLevelPages ? 'Yes' : 'No'}      
                        />
                    </ListItem>
                </List>

                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Configuration
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color={config.templateType ? 'success' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Template"
                        secondary={config.templateType || 'standard'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color={config.useBootstrap ? 'success' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Bootstrap"
                        secondary={config.useBootstrap ? 'Enabled' : 'Disabled'}
                      />
                    </ListItem>
                    
                  </List>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Content Overview */}
          <Accordion 
            expanded={expandedPanel === 'content'} 
            onChange={handleAccordionChange('content')}
            sx={{ mt: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileIcon />
                <Typography variant="h6">Content Overview</Typography>
                <Chip label={`${config.pages.length} pages`} size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Content Pages
                  </Typography>
                  {config.pages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No content pages created
                    </Typography>
                  ) : (
                    <List dense>
                      {config.pages
                        .sort((a, b) => a.order - b.order)
                        .map((page, index) => (
                        <ListItem key={page.id}>
                          <ListItemText
                            primary={`${index + 1}. ${page.title}`}
                            secondary={`Type: ${page.type}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Optional Pages
                  </Typography>
                  <List dense>
                    {[
                      { key: 'includeQuiz', label: 'Quiz/Assessment' },
                      { key: 'includePreassessment', label: 'Pre-assessment' },
                      { key: 'includeSurvey', label: 'Survey/Feedback' },
                      { key: 'includeResources', label: 'Resources' },
                      { key: 'includeContributors', label: 'Contributors' }
                    ].map(({ key, label }) => (
                      <ListItem key={key}>
                        <ListItemIcon>
                          <CheckIcon color={config[key as keyof LessonConfig] ? 'success' : 'disabled'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={label}
                          secondary={config[key as keyof LessonConfig] ? 'Included' : 'Not included'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Assets Overview */}
          <Accordion 
            expanded={expandedPanel === 'assets'} 
            onChange={handleAccordionChange('assets')}
            sx={{ mt: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon />
                <Typography variant="h6">Assets Overview</Typography>
                <Chip label={`${assets.length} files`} size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {assets.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No assets uploaded
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Path</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>{asset.name}</TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              label={asset.type} 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {(asset.file.size / 1024).toFixed(1)} KB
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {asset.path}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>

          {/* File Statistics */}
          <Card variant="outlined" sx={{ mt: 2, backgroundColor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Package Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {fileStats.totalFiles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Files
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {fileStats.htmlFiles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      HTML Pages
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {fileStats.assets}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Assets
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {fileStats.phpFiles}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PHP Files
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => handlePreview('config')}
            >
              Preview Config
            </Button>
            <Button
              variant="outlined"
              startIcon={<FolderIcon />}
              onClick={() => handlePreview('structure')}
            >
              Preview Structure
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, content: '', title: '' })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon />
          {previewDialog.title}
          <Tooltip title="Copy to clipboard">
            <IconButton
              size="small"
              onClick={() => copyToClipboard(previewDialog.content)}
            >
              <CopyIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          <Paper
            sx={{
              p: 2,
              backgroundColor: 'grey.900',
              color: 'white',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto',
              height: '100%',
              whiteSpace: 'pre-wrap'
            }}
          >
            {previewDialog.content}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, content: '', title: '' })}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={() => copyToClipboard(previewDialog.content)}
          >
            Copy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}