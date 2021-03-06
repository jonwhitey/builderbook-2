import {getTrainingSession} from '../../api/customer';

export const callGetTrainingSession = async (localUser) => {
    console.log('callGetTrainingSession');
    try {
        const {trainingSession} = await getTrainingSession({ localUser });

        if (!trainingSession) {
        console.log('callGetTrainingSession no trainingSession found');
        // eslint-disable-next-line consistent-return
        return null
    };
    return trainingSession;
    
    } catch (e) {
        console.log(e);
        return e;
    }
};