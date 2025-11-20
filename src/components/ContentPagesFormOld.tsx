import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Chip,
  Alert,
  Paper,
  Stack,
  TreeView,
  TreeItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  FolderOpen as FolderOpenIcon,
  Folder as FolderIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import type { LessonConfig, LessonPage } from '../types/lesson';

interface ContentPagesFormProps {
  config: LessonConfig;
  onChange: (updates: Partial<LessonConfig>) => void;
}

const PAGE_TYPE_OPTIONS = [
  { value: 'content', label: 'Content Page', color: 'primary' },
  { value: 'quiz', label: 'Quiz Page', color: 'secondary' },
  { value: 'preassessment', label: 'Pre-assessment', color: 'info' },
  { value: 'survey', label: 'Survey Page', color: 'warning' },
  { value: 'resources', label: 'Resources Page', color: 'success' }
] as const;

export default function ContentPagesForm({ config, onChange }: ContentPagesFormProps) {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['root']);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);
  const [jsonImportSuccess, setJsonImportSuccess] = useState<boolean>(false);

  const getPageTypeInfo = (type: string) => {
    return PAGE_TYPE_OPTIONS.find(option => option.value === type) || PAGE_TYPE_OPTIONS[0];
  };

  const handleAddPage = (level: number = 1, parentId?: string) => {
    const pageNumber = config.pages.filter(p => p.level === level && p.parentId === parentId).length + 1;
    const parentPage = parentId ? config.pages.find(p => p.id === parentId) : null;
    
    let pageIdentifier = '';
    if (level === 1) {
      pageIdentifier = `${pageNumber}-0-0`;
    } else if (level === 2) {
      const parentNum = parentPage ? parentPage.page?.split('-')[0] : '1';
      pageIdentifier = `${parentNum}-${pageNumber}-0`;
    } else if (level === 3) {
      const parentNums = parentPage ? parentPage.page?.split('-') : ['1', '1'];
      if (parentNums) {
        pageIdentifier = `${parentNums[0]}-${parentNums[1]}-${pageNumber}`;
      }
    }

    const newPage: LessonPage = {
      id: uuidv4(),
      title: `${level === 1 ? 'Page' : level === 2 ? 'Subpage' : 'Sub-subpage'} ${pageNumber}`,
      content: '<p>Add your content here...</p>',
      description: '',
      order: config.pages.length + 1,
      type: 'content',
      level,
      parentId,
      children: [],
      page: pageIdentifier,
      innerNode: false
    };

    const updatedPages = [...config.pages, newPage];
    
    // If adding to a parent, update parent's children array
    if (parentId) {
      const parentIndex = updatedPages.findIndex(p => p.id === parentId);
      if (parentIndex !== -1) {
        updatedPages[parentIndex] = {
          ...updatedPages[parentIndex],
          children: [...updatedPages[parentIndex].children, newPage]
        };
      }
    }

    onChange({ pages: updatedPages });
  };

  const updatePage = (pageId: string, updates: Partial<LessonPage>) => {
    const updatedPages = config.pages.map(page => 
      page.id === pageId ? { ...page, ...updates } : page
    );
    onChange({ pages: updatedPages });
  };

  const handleDeletePage = (pageId: string) => {
    const pageToDelete = config.pages.find(p => p.id === pageId);
    if (!pageToDelete) return;

    // Remove the page and all its children
    const updatedPages = config.pages.filter(page => {
      if (page.id === pageId) return false;
      if (page.parentId === pageId) return false;
      if (pageToDelete.children.some(child => child.id === page.id)) return false;
      return true;
    });

    // Update parent's children array if needed
    if (pageToDelete.parentId) {
      const parentIndex = updatedPages.findIndex(p => p.id === pageToDelete.parentId);
      if (parentIndex !== -1) {
        updatedPages[parentIndex] = {
          ...updatedPages[parentIndex],
          children: updatedPages[parentIndex].children.filter(child => child.id !== pageId)
        };
      }
    }

    onChange({ pages: updatedPages });
    
    if (selectedPage === pageId) {
      setSelectedPage(null);
    }
    if (editingPage === pageId) {
      setEditingPage(null);
    }
  };

  const handleJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = JSON.parse(e.target?.result as string);
        
        if (jsonContent.menu && Array.isArray(jsonContent.menu)) {
          const convertedPages = convertMenuToPages(jsonContent.menu);
          onChange({ pages: convertedPages });
          setJsonImportSuccess(true);
          setJsonImportError(null);
          setTimeout(() => setJsonImportSuccess(false), 3000);
        } else {
          setJsonImportError('Invalid JSON structure. Expected a "menu" array.');
        }
      } catch (error) {
        setJsonImportError('Invalid JSON file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const convertMenuToPages = (menu: any[], parentId?: string, level: number = 1): LessonPage[] => {
    const pages: LessonPage[] = [];
    
    menu.forEach((item, index) => {
      const page: LessonPage = {
        id: uuidv4(),
        title: item.title || `Page ${index + 1}`,
        content: item.content || '<p>Add your content here...</p>',
        description: item.description || '',
        order: index + 1,
        type: item.type || 'content',
        level,
        parentId,
        children: [],
        page: item.page || `${index + 1}-0-0`,
        innerNode: item.innerNode || false
      };

      pages.push(page);

      if (item.menu && Array.isArray(item.menu) && item.menu.length > 0) {
        const children = convertMenuToPages(item.menu, page.id, level + 1);
        page.children = children;
        pages.push(...children);
      }
    });

    return pages;
  };

  const buildTreeStructure = () => {
    const rootPages = config.pages.filter(page => page.level === 1);
    return rootPages.map(page => ({
      ...page,
      children: buildPageChildren(page.id)
    }));
  };

  const buildPageChildren = (parentId: string): LessonPage[] => {
    const children = config.pages.filter(page => page.parentId === parentId);
    return children.map(child => ({
      ...child,
      children: buildPageChildren(child.id)
    }));
  };

  const renderTreeNode = (page: LessonPage): React.ReactNode => {
    const pageTypeInfo = getPageTypeInfo(page.type);
    const hasChildren = page.children && page.children.length > 0;
    const isSelected = selectedPage === page.id;

    return (
      <TreeItem
        key={page.id}
        nodeId={page.id}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            {hasChildren ? <FolderOpenIcon fontSize="small" /> : <ArticleIcon fontSize="small" />}
            <Typography variant="body2" sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
              {page.title}
            </Typography>
            <Chip
              size="small"
              label={pageTypeInfo.label}
              color={pageTypeInfo.color}
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPage(page.id);
                  setEditingPage(page.id);
                }}
                sx={{ padding: 0.25 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePage(page.id);
                }}
                color="error"
                sx={{ padding: 0.25 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              {page.level < 3 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddPage(page.level + 1, page.id);
                  }}
                  color="primary"
                  sx={{ padding: 0.25 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        }
        onClick={() => setSelectedPage(page.id)}
      >
        {hasChildren && page.children.map(renderTreeNode)}
      </TreeItem>
    );
  };

  const renderTreeStructure = () => {
    const treeData = buildTreeStructure();

    return (
      <Box sx={{ display: 'flex', gap: 1, height: '400px' }}>
        {/* Left Panel - Tree Navigation */}
        <Paper sx={{ width: '50%', p: 1, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
            Page Structure
          </Typography>
          {treeData.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No pages yet
            </Typography>
          ) : (
            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              expanded={expandedNodes}
              onNodeToggle={(event, nodeIds) => setExpandedNodes(nodeIds)}
            >
              {treeData.map(renderTreeNode)}
            </TreeView>
          )}
        </Paper>

        {/* Right Panel - Page Editor */}
        <Paper sx={{ width: '50%', p: 1, overflow: 'auto' }}>
          {selectedPage && editingPage === selectedPage ? (
            <PageEditor 
              page={config.pages.find(p => p.id === selectedPage)!}
              onUpdate={(updates) => updatePage(selectedPage, updates)}
              onCancel={() => {
                setEditingPage(null);
                setSelectedPage(null);
              }}
            />
          ) : selectedPage ? (
            <PageViewer 
              page={config.pages.find(p => p.id === selectedPage)!}
              onEdit={() => setEditingPage(selectedPage)}
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Select a page to view or edit
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      <Card>
        <CardHeader 
          title="Content Structure" 
          subheader="Organize your lesson content into hierarchical pages"
        />
        <CardContent>
          {/* Import Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import Lesson Structure
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
              >
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={handleJsonImport}
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                Import a lesson structure from JSON file
              </Typography>
            </Stack>

            {jsonImportError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {jsonImportError}
              </Alert>
            )}

            {jsonImportSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Lesson structure imported successfully!
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Content Structure */}
          {config.pages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No pages yet. Import a lesson structure or add your first page.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pages will appear in the lesson navigation in the hierarchical order shown below.
              </Typography>
              
              {renderTreeStructure()}
            </Box>
          )}
        </CardContent>
        
        <CardActions>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => handleAddPage(1)}
          >
            Add Top Level Page
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

// Page Editor Component
interface PageEditorProps {
  page: LessonPage;
  onUpdate: (updates: Partial<LessonPage>) => void;
  onCancel: () => void;
}

function PageEditor({ page, onUpdate, onCancel }: PageEditorProps) {
  const [localPage, setLocalPage] = useState(page);

  const handleSave = () => {
    onUpdate(localPage);
    onCancel();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Edit Page
      </Typography>
      
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Page Title"
          value={localPage.title}
          onChange={(e) => setLocalPage({ ...localPage, title: e.target.value })}
        />
        
        <FormControl fullWidth>
          <InputLabel>Page Type</InputLabel>
          <Select
            value={localPage.type}
            label="Page Type"
            onChange={(e) => setLocalPage({ ...localPage, type: e.target.value as any })}
          >
            {PAGE_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={localPage.description}
          onChange={(e) => setLocalPage({ ...localPage, description: e.target.value })}
        />

        {localPage.type === 'content' && (
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Page Content"
            value={localPage.content || ''}
            onChange={(e) => setLocalPage({ ...localPage, content: e.target.value })}
            helperText="Enter the main content for this page"
          />
        )}

        <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// Page Viewer Component
interface PageViewerProps {
  page: LessonPage;
  onEdit: () => void;
}

function PageViewer({ page, onEdit }: PageViewerProps) {
  const pageTypeInfo = PAGE_TYPE_OPTIONS.find(option => option.value === page.type) || PAGE_TYPE_OPTIONS[0];

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6">
          {page.title}
        </Typography>
        <Chip
          size="small"
          label={pageTypeInfo.label}
          color={pageTypeInfo.color}
        />
        <Button size="small" onClick={onEdit} startIcon={<EditIcon />}>
          Edit
        </Button>
      </Stack>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <strong>Level:</strong> {page.level}
      </Typography>
      
      {page.description && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Description:</strong> {page.description}
        </Typography>
      )}
      
      {page.content && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Content Preview:</strong>
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="body2">
              {page.content.length > 200 
                ? page.content.substring(0, 200) + '...' 
                : page.content
              }
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}