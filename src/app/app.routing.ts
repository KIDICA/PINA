import { Routes, RouterModule } from '@angular/router';

import { RecognitionEmotionComponent } from './views/recognition-emotion';
import { RecognitionPersonComponent } from './views/recognition-person';
import { LoginComponent } from './views/login';
import { TrainingComponent } from './views/training';
import { CustomAdalGuard } from '@app/core/guards/customAdal.guard';
import { IntroductionComponent } from './views/introduction';
import { HighscoreComponent } from './views/highscore';
import { ConfigurationComponent } from './views/config';

const appRoutes: Routes = [
    { path: 'emotion', component: RecognitionEmotionComponent, canActivate: [CustomAdalGuard] },
    { path: 'person', component: RecognitionPersonComponent, canActivate: [CustomAdalGuard] },
    { path: 'config', component: ConfigurationComponent, canActivate: [CustomAdalGuard] },
    { path: 'intro', component: IntroductionComponent, canActivate: [CustomAdalGuard] },
    { path: 'training', component: TrainingComponent, canActivate: [CustomAdalGuard] },
    { path: 'highscore', component: HighscoreComponent, canActivate: [CustomAdalGuard] },
    { path: 'login', component: LoginComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: 'login' }
];

export const AppRouteModule = RouterModule.forRoot(appRoutes);
