'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '@/components/LoadingSpinner';

const interviewPreparerSchema = z.object({
  whatsappNumber: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit number'),
  interviewType: z.string().min(1, 'Please select interview type'),
  jobRole: z.string().min(1, 'Please enter your job role'),
  experienceLevel: z.string().min(1, 'Please select your experience level'),
  genderPreference: z.string().default('no_preference'),
  targetIndustry: z.string().default('Technology'),
  companySize: z.string().default('mid-size'),
  interviewFormat: z.string().default('remote'),
  preparationLevel: z.string().default('some_experience'),
  focusAreas: z.array(z.string()).min(1, 'Please select at least one focus area'),
  weakPoints: z.array(z.string()).default([]),
  practiceGoals: z.array(z.string()).default([]),
});

type InterviewPreparerFormData = z.input<typeof interviewPreparerSchema>;

export default function InterviewPreparerPage() {
  const router = useRouter();
  const [existingUserData, setExistingUserData] = useState<any>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InterviewPreparerFormData>({
    resolver: zodResolver(interviewPreparerSchema),
    defaultValues: {
      whatsappNumber: '',
      interviewType: '',
      jobRole: '',
      experienceLevel: '',
      genderPreference: 'no_preference',
      targetIndustry: 'Technology',
      companySize: 'mid-size',
      interviewFormat: 'remote',
      preparationLevel: 'some_experience',
      focusAreas: [],
      weakPoints: [],
      practiceGoals: [],
    },
  });

  const formValues = watch();

  // Check for existing user when whatsapp number is entered
  useEffect(() => {
    const checkExistingUser = async () => {
      if (formValues.whatsappNumber?.length === 10) {
        setIsCheckingUser(true);
        try {
          const response = await fetch('/api/users/lookup/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              whatsapp: formValues.whatsappNumber,
              agentType: 'interview_preparer',
            }),
          });
          const result = await response.json();

          if (result.found) {
            setExistingUserData(result);
            // Pre-fill form with existing data
            if (result.latestResponse) {
              const response = result.latestResponse;
              if (response.interviewType) setValue('interviewType', response.interviewType);
              if (response.jobRole) setValue('jobRole', response.jobRole);
              if (response.experienceLevel) setValue('experienceLevel', response.experienceLevel);
              if (response.genderPreference) setValue('genderPreference', response.genderPreference);
              if (response.targetIndustry) setValue('targetIndustry', response.targetIndustry);
              if (response.companySize) setValue('companySize', response.companySize);
              if (response.interviewFormat) setValue('interviewFormat', response.interviewFormat);
              if (response.preparationLevel) setValue('preparationLevel', response.preparationLevel);
              if (response.focusAreas) setValue('focusAreas', response.focusAreas);
              if (response.weakPoints) setValue('weakPoints', response.weakPoints);
              if (response.practiceGoals) setValue('practiceGoals', response.practiceGoals);
            }
          } else {
            setExistingUserData(null);
          }
        } catch (error) {
          console.error('Error checking existing user:', error);
        } finally {
          setIsCheckingUser(false);
        }
      } else {
        setExistingUserData(null);
      }
    };

    checkExistingUser();
  }, [formValues.whatsappNumber, setValue]);

  const onSubmit = async (data: InterviewPreparerFormData) => {
    try {
      // Create user with whatsapp number
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: data.whatsappNumber,
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create user');
      }

      const user = await userResponse.json();

      // Save Interview preparer responses (excluding whatsappNumber)
      const { whatsappNumber, ...interviewData } = data;
      const responseData = await fetch('/api/interview-preparer-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...interviewData,
        }),
      });

      if (!responseData.ok) {
        throw new Error('Failed to save responses');
      }

      const response = await responseData.json();

      // Navigate to session page
      router.push(
        `/interview-preparer/session?userId=${user.id}&responseId=${response.id}`
      );
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors py-6 sm:py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Interview Preparer</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
          Answer a few questions to customize your interview practice
        </p>

        <div className="relative">
          {isCheckingUser && (
            <LoadingSpinner
              overlay={true}
              message="Checking for existing account..."
              size="md"
            />
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="whatsappNumber" className="text-gray-700 dark:text-gray-300">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                type="tel"
                {...register('whatsappNumber')}
                placeholder="Enter your 10-digit number"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
              {errors.whatsappNumber && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.whatsappNumber.message}
                </p>
              )}
              {existingUserData && !isCheckingUser && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                  ✓ Welcome back! Your previous preferences have been loaded.
                </p>
              )}
            </div>

          <div>
            <Label htmlFor="interviewType" className="text-gray-700 dark:text-gray-300">Interview Type</Label>
            <Select
              value={formValues.interviewType}
              onValueChange={(value) => setValue('interviewType', value)}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="case_study">Case Study</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            {errors.interviewType && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.interviewType.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="jobRole" className="text-gray-700 dark:text-gray-300">Job Role</Label>
            <Input
              id="jobRole"
              {...register('jobRole')}
              placeholder="e.g., Senior Software Engineer"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
            {errors.jobRole && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.jobRole.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="experienceLevel" className="text-gray-700 dark:text-gray-300">Experience Level</Label>
            <Select
              value={formValues.experienceLevel}
              onValueChange={(value) => setValue('experienceLevel', value)}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                <SelectItem value="lead">Lead Level (10+ years)</SelectItem>
              </SelectContent>
            </Select>
            {errors.experienceLevel && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.experienceLevel.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="focusAreas" className="text-gray-700 dark:text-gray-300">
              Focus Areas
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {['Technical Skills', 'Behavioral Questions', 'Problem Solving', 'Communication',
                'Leadership', 'System Design', 'Coding', 'Culture Fit'].map((area) => {
                const isSelected = formValues.focusAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setValue('focusAreas', formValues.focusAreas.filter((a) => a !== area));
                      } else {
                        setValue('focusAreas', [...formValues.focusAreas, area]);
                      }
                    }}
                    className={`px-3 py-2.5 sm:px-2 sm:py-1.5 rounded-md font-medium text-sm sm:text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white ring-1 ring-indigo-300 dark:ring-indigo-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
            {errors.focusAreas && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.focusAreas.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            {isSubmitting ? 'Starting session...' : 'Start Session'}
          </Button>
        </form>
        </div>
      </div>
    </div>
  );
}
