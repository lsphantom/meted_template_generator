import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  Switch,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import type { LessonConfig } from '../types/lesson';

interface TemplateSettingsProps {
  config: LessonConfig;
  onChange: (updates: Partial<LessonConfig>) => void;
}

const templateTypes = [
  {
    value: 'latest_core_legacy_standard' as const,
    label: 'Latest Core - Legacy Standard',
    description: 'Modern core framework with traditional MetEd lesson layout and navigation',
    features: ['Latest MetEd Core', 'Legacy compatibility', 'Standard navigation', 'Traditional layout', 'Print support']
  },
  {
    value: 'latest_core_legacy_articulate' as const,
    label: 'Latest Core - Legacy Articulate Launcher',
    description: 'Latest core with legacy Articulate Rise launcher compatibility',
    features: ['Latest MetEd Core', 'Articulate launcher support', 'Legacy Rise compatibility', 'Interactive elements', 'Mobile-optimized']
  },
  {
    value: 'latest_core_lms_agnostic' as const,
    label: 'Latest Core - LMS Agnostic',
    description: 'Latest core framework designed for compatibility with any Learning Management System',
    features: ['Latest MetEd Core', 'LMS compatibility', 'SCORM ready', 'Universal deployment', 'Standards compliant']
  }
];

export default function TemplateSettings({ config, onChange }: TemplateSettingsProps) {
  const [previewDialog, setPreviewDialog] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<string>('template');

  const handleTemplateChange = (templateType: LessonConfig['templateType']) => {
    onChange({ templateType });
  };

  const handleBootstrapChange = (useBootstrap: boolean) => {
    onChange({ useBootstrap });
  };

  const handleAccordionChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? panel : '');
  };

  const getSelectedTemplate = () => {
    return templateTypes.find(template => template.value === config.templateType) || templateTypes[0];
  };

  const resetToDefaults = () => {
    onChange({ 
      templateType: 'latest_core_legacy_standard', 
      useBootstrap: false
    });
  };

  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto', padding: 2 }}>
      <Card>
        <CardHeader
          title="Template Settings"
          subheader="Configure the appearance and behavior of your lesson"
          action={
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewDialog(true)}
            >
              Preview
            </Button>
          }
        />
        <CardContent>
          {/* Template Type Selection */}
          <Accordion 
            expanded={expandedPanel === 'template'} 
            onChange={handleAccordionChange('template')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon />
                <Typography variant="h6">Template Type</Typography>
                <Chip 
                  label={getSelectedTemplate().label} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  Choose a template for your lesson
                </FormLabel>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {templateTypes.map((template) => (
                    <Card
                      key={template.value}
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        border: config.templateType === template.value ? 2 : 1,
                        borderColor: config.templateType === template.value ? 'primary.main' : 'divider',
                        backgroundColor: config.templateType === template.value ? 'primary.50' : 'background.paper',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => handleTemplateChange(template.value)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Radio
                            checked={config.templateType === template.value}
                            value={template.value}
                            sx={{ mt: 0.5 }}
                            color="primary"
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {template.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {template.description}
                            </Typography>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                Features:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                {template.features.map((feature, index) => (
                                  <Chip
                                    key={index}
                                    label={feature}
                                    size="small"
                                    variant={config.templateType === template.value ? "filled" : "outlined"}
                                    color={config.templateType === template.value ? "primary" : "default"}
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          {/* Framework Options */}
          <Accordion 
            expanded={expandedPanel === 'framework'} 
            onChange={handleAccordionChange('framework')}
            sx={{ mt: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon />
                <Typography variant="h6">Framework Options</Typography>
                {config.useBootstrap && (
                  <Chip label="Bootstrap Enabled" size="small" color="success" variant="outlined" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.useBootstrap}
                        onChange={(e) => handleBootstrapChange(e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1">
                          Use Bootstrap CSS Framework
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Include Bootstrap for responsive design and pre-built components
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
                
                {config.useBootstrap && (
                  <Box>
                    <Alert severity="info" icon={<InfoIcon />}>
                      <Typography variant="body2">
                        Bootstrap CSS and JavaScript will be included in your lesson package. 
                        This provides a responsive grid system, form controls, and interactive components.
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Template Summary */}
          <Card variant="outlined" sx={{ mt: 2, backgroundColor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Template Configuration Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Template Type"
                    secondary={getSelectedTemplate().label}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color={config.useBootstrap ? 'success' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Bootstrap Framework"
                    secondary={config.useBootstrap ? 'Enabled' : 'Disabled'}
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={resetToDefaults}
                >
                  Reset to Defaults
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPreviewDialog(true)}
                  startIcon={<PreviewIcon />}
                >
                  Preview Template
                </Button>
              </Box>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          Template Preview - {getSelectedTemplate().label}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              height: '100%',
              backgroundColor: 'white',
              position: 'relative'
            }}
          >
            {/* Mock lesson preview */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ 
                textAlign: 'center', 
                mb: 3, 
                pb: 2, 
                borderBottom: 2, 
                borderColor: 'primary.main' 
              }}>
                <Typography variant="h4" color="primary">
                  {config.lessonTitle || 'Sample Lesson Title'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {config.description || 'Sample lesson description'}
                </Typography>
              </Box>
              
              {config.useBootstrap && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Bootstrap framework is enabled - responsive grid and components available
                </Alert>
              )}
              
              <Box sx={{ 
                backgroundColor: 'grey.100', 
                p: 2, 
                borderRadius: 1, 
                mb: 2 
              }}>
                <Typography variant="h6">Navigation Menu</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {['Home', 'Page 1', 'Page 2', 'Quiz', 'Resources'].map((item) => (
                    <Chip key={item} label={item} variant="outlined" />
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="h5" gutterBottom>
                  Sample Content Page
                </Typography>
                <Typography variant="body1" paragraph>
                  This is how your lesson content will appear with the selected template and settings.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}