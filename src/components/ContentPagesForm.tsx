import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  MoveUp as MoveUpIcon,
  MoveDown as MoveDownIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import type { LessonConfig, LessonPage } from '../types/lesson';

interface ContentPagesFormProps {
  config: LessonConfig;
  onChange: (updates: Partial<LessonConfig>) => void;
}

const pageTypes = [
  { value: 'content', label: 'Content Page', color: 'primary' },
  { value: 'quiz', label: 'Quiz Page', color: 'secondary' },
  { value: 'preassessment', label: 'Pre-assessment', color: 'info' },
  { value: 'survey', label: 'Survey Page', color: 'warning' },
  { value: 'resources', label: 'Resources Page', color: 'success' }
] as const;

export default function ContentPagesForm({ config, onChange }: ContentPagesFormProps) {
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  const handleAddPage = () => {
    const newPage: LessonPage = {
      id: uuidv4(),
      title: `Page ${config.pages.length + 1}`,
      content: '<p>Add your content here...</p>',
      order: config.pages.length + 1,
      type: 'content'
    };

    const updatedPages = [...config.pages, newPage];
    onChange({ pages: updatedPages });
    setEditingPage(newPage.id);
    setExpandedPage(newPage.id);
  };

  const handleDeletePage = (pageId: string) => {
    const updatedPages = config.pages
      .filter(page => page.id !== pageId)
      .map((page, index) => ({ ...page, order: index + 1 }));
    
    onChange({ pages: updatedPages });
    
    if (editingPage === pageId) {
      setEditingPage(null);
    }
    if (expandedPage === pageId) {
      setExpandedPage(null);
    }
  };

  const handleUpdatePage = (pageId: string, updates: Partial<LessonPage>) => {
    const updatedPages = config.pages.map(page =>
      page.id === pageId ? { ...page, ...updates } : page
    );
    onChange({ pages: updatedPages });
  };

  const handleMovePage = (pageId: string, direction: 'up' | 'down') => {
    const currentIndex = config.pages.findIndex(page => page.id === pageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= config.pages.length) return;

    const updatedPages = [...config.pages];
    const [movedPage] = updatedPages.splice(currentIndex, 1);
    updatedPages.splice(newIndex, 0, movedPage);

    // Update order numbers
    const reorderedPages = updatedPages.map((page, index) => ({
      ...page,
      order: index + 1
    }));

    onChange({ pages: reorderedPages });
  };

  const handleAccordionChange = (pageId: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPage(isExpanded ? pageId : null);
  };

  const getPageTypeInfo = (type: LessonPage['type']) => {
    return pageTypes.find(pt => pt.value === type) || pageTypes[0];
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 2 }}>
      <Card>
        <CardHeader
          title="Content Pages"
          subheader={`Manage your lesson content (${config.pages.length} page${config.pages.length !== 1 ? 's' : ''})`}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPage}
            >
              Add Page
            </Button>
          }
        />
        <CardContent>
          {config.pages.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No pages created yet. Click "Add Page" to start building your lesson content.
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pages will appear in the lesson navigation in the order shown below.
              </Typography>
              
              {config.pages
                .sort((a, b) => a.order - b.order)
                .map((page, index) => {
                  const pageTypeInfo = getPageTypeInfo(page.type);
                  const isExpanded = expandedPage === page.id;
                  const isEditing = editingPage === page.id;

                  return (
                    <Accordion
                      key={page.id}
                      expanded={isExpanded}
                      onChange={handleAccordionChange(page.id)}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            gap: 2
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                          <DragIcon color="action" />
                          <Typography variant="h6">
                            {page.order}. {page.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={pageTypeInfo.label}
                            color={pageTypeInfo.color}
                            variant="outlined"
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMovePage(page.id, 'up');
                            }}
                            disabled={index === 0}
                          >
                            <MoveUpIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMovePage(page.id, 'down');
                            }}
                            disabled={index === config.pages.length - 1}
                          >
                            <MoveDownIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color={isEditing ? 'primary' : 'default'}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPage(isEditing ? null : page.id);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(page.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Page Title"
                              value={page.title}
                              onChange={(e) => handleUpdatePage(page.id, { title: e.target.value })}
                              disabled={!isEditing}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth disabled={!isEditing}>
                              <InputLabel>Page Type</InputLabel>
                              <Select
                                value={page.type}
                                label="Page Type"
                                onChange={(e) => 
                                  handleUpdatePage(page.id, { type: e.target.value as LessonPage['type'] })
                                }
                              >
                                {pageTypes.map((type) => (
                                  <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" gutterBottom>
                              Page Content
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={8}
                              label="HTML Content"
                              value={page.content}
                              onChange={(e) => handleUpdatePage(page.id, { content: e.target.value })}
                              disabled={!isEditing}
                              placeholder="Enter HTML content for this page..."
                              helperText={
                                isEditing 
                                  ? "You can use HTML tags to format your content. Images and other assets can be referenced from the assets folder."
                                  : "Click the edit button to modify this page's content"
                              }
                              sx={{
                                '& .MuiInputBase-input': {
                                  fontFamily: 'monospace',
                                  fontSize: '0.875rem'
                                }
                              }}
                            />
                          </Grid>

                          {!isEditing && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" gutterBottom>
                                Content Preview
                              </Typography>
                              <Box
                                sx={{
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 2,
                                  backgroundColor: 'grey.50',
                                  maxHeight: 200,
                                  overflow: 'auto'
                                }}
                                dangerouslySetInnerHTML={{ __html: page.content }}
                              />
                            </Grid>
                          )}
                        </Grid>

                        {isEditing && (
                          <CardActions sx={{ justifyContent: 'flex-end', pt: 2 }}>
                            <Button
                              variant="outlined"
                              onClick={() => setEditingPage(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              onClick={() => setEditingPage(null)}
                            >
                              Save Changes
                            </Button>
                          </CardActions>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
            </Box>
          )}
        </CardContent>
      </Card>

      {config.pages.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardHeader
            title="Page Structure Summary"
            subheader="Overview of your lesson's page structure"
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your lesson will have the following page structure:
            </Typography>
            <Box component="ol" sx={{ pl: 2 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>index.htm</strong> - Main lesson homepage with navigation
                </Typography>
              </Box>
              {config.pages
                .sort((a, b) => a.order - b.order)
                .map((page, index) => {
                  const pageTypeInfo = getPageTypeInfo(page.type);
                  return (
                    <Box component="li" key={page.id} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>page{index + 1}.htm</strong> - {page.title}
                        <Chip
                          size="small"
                          label={pageTypeInfo.label}
                          color={pageTypeInfo.color}
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}