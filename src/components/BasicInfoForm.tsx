import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Checkbox,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  Divider
} from '@mui/material';
import type { LessonConfig } from '../types/lesson';

interface BasicInfoFormProps {
  config: LessonConfig;
  onChange: (updates: Partial<LessonConfig>) => void;
}

export default function BasicInfoForm({ config, onChange }: BasicInfoFormProps) {
  const handleChange = (field: keyof LessonConfig) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      onChange({ [field]: value });
    };

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader align="left"
        title="Basic Information"
        subheader="Configure the basic template details and settings."
      />
      <CardContent>
        <Stack spacing={3}>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Language Field */}
            <TextField
                select
                fullWidth
                label="Language"
                value={config.language || 'English'}
                onChange={handleChange('language')}
                helperText="Primary language of the lesson"
            >
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Spanish">Spanish</MenuItem>
            <MenuItem value="French">French</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
            </TextField>
            {/* Lesson ID */}
            <TextField
              fullWidth
              label="Lesson ID"
              value={config.lessonId || ''}
              onChange={handleChange('lessonId')}
              placeholder="e.g., 10355"
              helperText="Unique identifier for the lesson"
            />
          </Box>
            
          {/* Lesson Title */}  
          <TextField
              fullWidth
              label="Lesson Title"
              value={config.lessonTitle || ''}
              onChange={handleChange('lessonTitle')}
              placeholder="Enter the full title of your lesson"
              required
            />

          {/* MetEd Path */}
          <TextField
            fullWidth
            label="MetEd Path"
            value={config.metedPath || ''}
            onChange={handleChange('metedPath')}
            placeholder="e.g., /satmet/geocolor/"
            helperText="Path structure for MetEd deployment (include trailing slash)"
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            value={config.description || ''}
            onChange={handleChange('description')}
            multiline
            rows={3}
            placeholder="Detailed description of the lesson content"
            helperText="Main description that will appear on the lesson page"
          />


          {/* Keywords */}
          <TextField
            fullWidth
            label="Keywords"
            value={config.keywords || ''}
            onChange={handleChange('keywords')}
            placeholder="satellite, meteorology, remote sensing, GOES"
            helperText="Comma-separated keywords for search and categorization"
          />

          <Divider />

          {/* Feature Options Section */}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Additional Options
            </Typography>
            
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Change additional component settings for the template:
              </FormLabel>
              <FormGroup>

                {/* Custom Copyright Year Field, Image Credit Field  */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Custom Copyright Year(s)"
                    value={config.customCopyrightYear || ''}
                    onChange={handleChange('customCopyrightYear')}
                    placeholder="e.g., 2010-2018 (leave blank to use current year)"
                    helperText="Optional: Override the default copyright year"
                    type="text"
                  />

                  <TextField
                    fullWidth
                    label="Custom Cover Image Credit"
                    value={config.customCoverImageCredit || ''}
                    onChange={handleChange('customCoverImageCredit')}
                    placeholder="e.g., Creative Commons John Doe Smith (leave blank to use default credit)"
                    helperText="Optional: Override the default cover image credit"
                    type="text"
                  />


                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.includeNarratedTextSwitch || false}
                        onChange={handleChange('includeNarratedTextSwitch')}
                        color="primary"
                      />
                    }
                    label="Include Narrated/Text Switch"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.includeAdditionalTopLevelPages || false}
                        onChange={handleChange('includeAdditionalTopLevelPages')}
                        color="primary"
                      />
                    }
                    label="Include Additional Top-Level Pages"
                  />
                  
                </Box>
                
                {/* Conditional Additional Pages Options */}
                {config.includeAdditionalTopLevelPages && (
                  <Box sx={{ mt: 2, ml: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Select which additional pages to include:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={config.includeContributorsPage || false}
                            onChange={handleChange('includeContributorsPage')}
                            color="primary"
                          />
                        }
                        label="Contributors Page"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={config.includeReferencesPage || false}
                            onChange={handleChange('includeReferencesPage')}
                            color="primary"
                          />
                        }
                        label="References Page"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={config.includeResourcesPage || false}
                            onChange={handleChange('includeResourcesPage')}
                            color="primary"
                          />
                        }
                        label="Resources Page"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={config.includeCustomPage || false}
                            onChange={handleChange('includeCustomPage')}
                            color="primary"
                          />
                        }
                        label="Custom Page"
                      />
                    </Box>
                    
                    {/* Custom Page Title Field */}
                    {config.includeCustomPage && (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Custom Page Title"
                          value={config.customPageTitle || ''}
                          onChange={handleChange('customPageTitle')}
                          placeholder="Enter title for custom page"
                          helperText="Title for the custom page (e.g., 'About', 'FAQ', 'Help')"
                          size="small"
                        />
                      </Box>
                    )}
                  </Box>
                )}
                
              </FormGroup>
            </FormControl>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}