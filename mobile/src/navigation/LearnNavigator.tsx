import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CourseCatalogScreen from '../screens/learn/CourseCatalogScreen';
import CourseDetailScreen from '../screens/learn/CourseDetailScreen';
import CoursePlayerScreen from '../screens/learn/CoursePlayerScreen';
import TextLessonScreen from '../screens/learn/TextLessonScreen';
import QuizStartScreen from '../screens/learn/QuizStartScreen';
import QuizQuestionScreen from '../screens/learn/QuizQuestionScreen';
import QuizResultScreen from '../screens/learn/QuizResultScreen';
import AssignmentUploadScreen from '../screens/learn/AssignmentUploadScreen';
import DiscussionThreadScreen from '../screens/learn/DiscussionThreadScreen';
import CreatePostScreen from '../screens/learn/CreatePostScreen';
import CertificateViewScreen from '../screens/learn/CertificateViewScreen';
import OfflineDownloadsScreen from '../screens/learn/OfflineDownloadsScreen';
import MentorListScreen from '../screens/learn/MentorListScreen';
import MentorBookingScreen from '../screens/learn/MentorBookingScreen';

const Stack = createNativeStackNavigator();

export default function LearnNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CourseCatalog" component={CourseCatalogScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="CoursePlayer" component={CoursePlayerScreen} />
      <Stack.Screen name="TextLesson" component={TextLessonScreen} />
      <Stack.Screen name="QuizStart" component={QuizStartScreen} />
      <Stack.Screen name="QuizQuestion" component={QuizQuestionScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
      <Stack.Screen name="AssignmentUpload" component={AssignmentUploadScreen} />
      <Stack.Screen name="DiscussionThread" component={DiscussionThreadScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="CertificateView" component={CertificateViewScreen} />
      <Stack.Screen name="OfflineDownloads" component={OfflineDownloadsScreen} />
      <Stack.Screen name="MentorList" component={MentorListScreen} />
      <Stack.Screen name="MentorBooking" component={MentorBookingScreen} />
    </Stack.Navigator>
  );
}
