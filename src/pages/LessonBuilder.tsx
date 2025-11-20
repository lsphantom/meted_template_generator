import { useState } from 'react'
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert
} from '@mui/material'
import type { LessonConfig, AssetFile } from '../types/lesson'
import BasicInfoForm from '../components/BasicInfoForm'
import ContentPagesForm from '../components/ContentPagesForm'
import AssetsManager from '../components/AssetsManager'
import TemplateSettings from '../components/TemplateSettings'
import PreviewAndExport from '../components/PreviewAndExport'

const steps = [
  'Basic Information',
  'Template Settings',
  'Content Pages',
  'Assets & Media',
  'Preview & Export'
]

const initialConfig: LessonConfig = {
  language: 'English',
  lessonTitle: '',
  lessonId: '',
  metedPath: '',
  description: '',
  objectives: '',
  keywords: '',
  authorName: '',
  authorEmail: '',
  organizationName: '',
  organizationAcronym: '',
  pubMonth: new Date().toLocaleString('default', { month: 'long' }),
  pubYear: new Date().getFullYear().toString(),
  version: '1.0',
  publicationDate: '',
  lastModified: '',
  templateTheme: '',
  templateType: 'latest_core_legacy_standard',
  useBootstrap: true,
  includeQuiz: false,
  includeGlossary: false,
  includeReferences: false,
  includeResources: false,
  includeNarratedTextSwitch: false,
  includeAdditionalTopLevelPages: false,
  includeContributorsPage: false,
  includeReferencesPage: false,
  includeResourcesPage: false,
  includeCustomPage: false,
  includePreassessment: false,
  includeSurvey: false,
  includeContributors: false,
  enablePrintableVersion: false,
  enableProgressTracking: false,
  enableAccessibility: false,
  enableMobileOptimization: false,
  pages: []
}

export default function LessonBuilder() {
  const [activeStep, setActiveStep] = useState(0)
  const [lessonConfig, setLessonConfig] = useState<LessonConfig>(initialConfig)
  const [assets, setAssets] = useState<AssetFile[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const handleNext = () => {
    const stepErrors = validateStep(activeStep)
    if (stepErrors.length === 0) {
      setErrors([])
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    } else {
      setErrors(stepErrors)
    }
  }

  const handleBack = () => {
    setErrors([])
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const validateStep = (step: number): string[] => {
    const errors: string[] = []
    
    switch (step) {
      case 0: // Basic Information
        if (!lessonConfig.lessonId.trim()) errors.push('Lesson ID is required')
        if (!lessonConfig.lessonTitle.trim()) errors.push('Lesson title is required')
        break
      case 1: // Template Settings - no required validation
        break
      case 2: // Content Pages
        if (lessonConfig.pages.length === 0) errors.push('At least one content page is required')
        break
      case 3: // Assets - no required validation
        break
    }
    
    return errors
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoForm 
            config={lessonConfig} 
            onChange={(updates: Partial<LessonConfig>) => setLessonConfig(prev => ({ ...prev, ...updates }))} 
          />
        )
      case 1:
        return (
          <TemplateSettings 
            config={lessonConfig} 
            onChange={(updates: Partial<LessonConfig>) => setLessonConfig(prev => ({ ...prev, ...updates }))} 
          />
        )
      case 2:
        return (
          <ContentPagesForm 
            config={lessonConfig} 
            onChange={(updates: Partial<LessonConfig>) => setLessonConfig(prev => ({ ...prev, ...updates }))} 
          />
        )
      case 3:
        return (
          <AssetsManager 
            assets={assets} 
            onChange={setAssets} 
          />
        )
      case 4:
        return (
          <PreviewAndExport 
            config={lessonConfig} 
            assets={assets} 
          />
        )
      default:
        return 'Unknown step'
    }
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={2} sx={{ 
        p: 3, 
        mb: 2, 
        width: '100%',
        maxWidth: '1200px',
        minHeight: '600px'
      }}>
        
        <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Please fix the following errors:</Typography>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        <Box sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep < steps.length - 1 && (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}