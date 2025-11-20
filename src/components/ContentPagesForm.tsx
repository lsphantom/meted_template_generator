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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FolderOpen as UnitIcon
} from '@mui/icons-material';
import type { LessonConfig, LessonPage } from '../types/lesson';

interface Unit {
  id: string;
  title: string;
  description?: string;
}

interface ContentPagesFormProps {
  onChange: (updates: Partial<LessonConfig>) => void;
}

export default function ContentPagesForm({ onChange }: ContentPagesFormProps) {
  const [units, setUnits] = useState<Unit[]>([
    {
      id: 'unit-default',
      title: 'Unit Title',
      description: 'Default unit - edit or add more units as needed'
    }
  ]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitDescription, setNewUnitDescription] = useState('');

  // Initialize lesson configuration with default unit
  React.useEffect(() => {
    const lessonPages: LessonPage[] = units.map((unit, index) => ({
      id: `${index + 1}`,
      title: unit.title,
      description: unit.description,
      content: '<p>Unit content will be scaffolded in the template</p>',
      order: index + 1,
      type: 'content',
      level: 1,
      children: [],
      page: `${index + 1}-0-0`,
      innerNode: false
    }));
    onChange({ pages: lessonPages });
  }, [units, onChange]);

  const handleAddUnit = () => {
    if (!newUnitTitle.trim()) return;

    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      title: newUnitTitle.trim(),
      description: newUnitDescription.trim() || undefined
    };

    const updatedUnits = [...units, newUnit];
    setUnits(updatedUnits);
    
    // Reset form
    setNewUnitTitle('');
    setNewUnitDescription('');
    setIsAddDialogOpen(false);
  };

  const handleDeleteUnit = (unitId: string) => {
    // Prevent deletion if this is the only unit
    if (units.length <= 1) {
      alert('A template must contain at least one unit. Add another unit before deleting this one.');
      return;
    }

    const updatedUnits = units.filter(unit => unit.id !== unitId);
    setUnits(updatedUnits);
    
    if (selectedUnitId === unitId) {
      setSelectedUnitId(null);
    }
  };

  const renderUnitItem = (unit: Unit) => {
    const unitIndex = units.indexOf(unit) + 1;
    
    return (
      <ListItemButton
        key={unit.id}
        sx={{ 
          backgroundColor: selectedUnitId === unit.id ? 'action.selected' : 'transparent',
          mb: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}
        onClick={() => setSelectedUnitId(unit.id)}
      >
        <ListItemIcon>
          <UnitIcon color="primary" />
        </ListItemIcon>
        <ListItemText 
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {unit.title}
              </Typography>
              <Chip 
                label={`Unit ${unitIndex}`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`print_${unitIndex}.php`} 
                size="small" 
                color="secondary" 
                variant="outlined" 
              />
            </Box>
          }
          secondary={
            unit.description ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {unit.description}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                This unit will generate a template scaffold for print_{unitIndex}.php
              </Typography>
            )
          }
        />
        <IconButton
          edge="end"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteUnit(unit.id);
          }}
          color="error"
          disabled={units.length <= 1}
          title={units.length <= 1 ? 'Cannot delete the last unit' : 'Delete unit'}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemButton>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      <Card>
        <CardHeader 
          title="Content Structure" 
          subheader="Create units that will generate template scaffolds (print.php files) for your lesson"
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Each unit you create here will generate a corresponding print.php file in your exported lesson package.
            These serve as templates that you can fill with actual content later in a separate content management system.
          </Typography>

          {units.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6, 
              backgroundColor: 'grey.50', 
              borderRadius: 1,
              border: '2px dashed',
              borderColor: 'grey.300'
            }}>
              <UnitIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Units Created Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start by adding your first unit to scaffold your lesson structure
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add First Unit
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Lesson Units ({units.length})
              </Typography>
              
              <List sx={{ mb: 2 }}>
                {units.map(unit => renderUnitItem(unit))}
              </List>
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'info.50', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'info.200'
              }}>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  📁 Generated Template Files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your lesson package will include: {units.map((_, index) => `print_${index + 1}.php`).join(', ')}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
        
        {units.length > 0 && (
          <CardActions>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => setIsAddDialogOpen(true)}
            >
              Add Unit
            </Button>
          </CardActions>
        )}
      </Card>

      {/* Add Unit Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Unit</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Unit Title"
              value={newUnitTitle}
              onChange={(e) => setNewUnitTitle(e.target.value)}
              placeholder="e.g., Introduction to Weather Patterns"
              sx={{ mb: 2 }}
              autoFocus
            />
            <TextField
              fullWidth
              label="Unit Description (optional)"
              value={newUnitDescription}
              onChange={(e) => setNewUnitDescription(e.target.value)}
              placeholder="Brief description of what this unit covers..."
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddUnit}
            variant="contained"
            disabled={!newUnitTitle.trim()}
          >
            Add Unit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}