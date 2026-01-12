import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface HRMSRecord {
    name: string;
    owner: string;
    creation: string;
    modified: string;
    modified_by: string;
    docstatus: number;
    idx: number;
    employee: string;
    naming_series: string;
    first_name: string;
    employee_name: string;
    gender: string;
    date_of_birth: string;
    salutation: string;
    date_of_joining: string;
    image: string;
    status: string;
    skip_geo_check: number;
    user_id: string;
    create_user_permission: number;
    company: string;
    department: string;
    employment_type: string;
    designation: string;
    reports_to: string;
    branch: string;
    notice_number_of_days: number;
    date_of_retirement: string;
    cell_number: string;
    '10_certificate': string;
    personal_email: string;
    company_email: string;
    prefered_contact_email: string;
    prefered_email: string;
    unsubscribed: number;
    current_accommodation_type: string;
    permanent_accommodation_type: string;
    person_to_be_contacted: string;
    emergency_phone_number: string;
    relation: string;
    attendance_device_id: string;
    holiday_list: string;
    default_shift: string;
    leave_approver: string;
    shift_request_approver: string;
    ctc: number;
    salary_currency: string;
    salary_mode: string;
    payroll_cost_center: string;
    pan_number: string;
    bank_name: string;
    bank_ac_no: string;
    ifsc_code: string;
    micr_code: string;
    marital_status: string;
    blood_group: string;
    leave_encashed: string;
    lft: number;
    rgt: number;
    old_parent: string;
    doctype: string;
    internal_work_history: any[];
    external_work_history: any[];
    education: any[];
}

export interface FeedPost {
    name: string;
    owner: string;
    creation: string;
    modified: string;
    modified_by: string;
    docstatus: number;
    idx: number;
    author: string;
    role: string;
    content: string;
    type: string;
    attach_image_aksn: string;
    name1: string;
}

export interface OnlineUser {
    file_url: string;
    attached_to_name: string;
}

export interface BirthdayAnniversary {
    employee_name: string;
    date_of_joining: string;
    date_of_birth: string;
    employee: string;
    reports_to: string;
}

interface HRMSContextType {
    hrmsData: HRMSRecord | null;
    feedPosts: FeedPost[];
    onlineUsers: OnlineUser[];
    birthdaysAnniversaries: BirthdayAnniversary[];
    allEmployees: BirthdayAnniversary[];
    isLoading: boolean;
    error: string | null;
    fetchHRMSData: (employeeId: string, force?: boolean) => Promise<void>;
    fetchFeedPosts: () => Promise<void>;
    fetchOnlineUsers: () => Promise<void>;
    fetchBirthdaysAnniversaries: (force?: boolean) => Promise<void>;
    createFeedPost: (postData: {
        employee: string;
        designation: string;
        name: string;
        content: string;
        type: string;
    }) => Promise<void>;
}

const HRMSContext = createContext<HRMSContextType | undefined>(undefined);

export const useHRMS = () => {
    const context = useContext(HRMSContext);
    if (context === undefined) {
        throw new Error('useHRMS must be used within an HRMSProvider');
    }
    return context;
};

interface HRMSProviderProps {
    children: ReactNode;
}

export const HRMSProvider: React.FC<HRMSProviderProps> = ({ children }) => {
    const [hrmsData, setHrmsData] = useState<HRMSRecord | null>(null);
    const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [birthdaysAnniversaries, setBirthdaysAnniversaries] = useState<BirthdayAnniversary[]>([]);
    const [allEmployees, setAllEmployees] = useState<BirthdayAnniversary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHRMSData = useCallback(async (employeeId: string, force = false) => {
        if (!force && hrmsData && hrmsData.employee === employeeId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://n8n.gopocket.in/webhook/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: 'hrms',
                    employee: employeeId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch HRMS data: ${response.statusText}`);
            }

            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                setHrmsData(data[0]);
            } else {
                setHrmsData(null);
            }
        } catch (err) {
            console.error('Error fetching HRMS data:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchFeedPosts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://n8n.gopocket.in/webhook/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: 'chat'
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch feed posts: ${response.statusText}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                // Sort by creation date descending (newest first)
                const sortedPosts = [...data].sort((a, b) =>
                    new Date(b.creation).getTime() - new Date(a.creation).getTime()
                );
                setFeedPosts(sortedPosts);
            } else {
                setFeedPosts([]);
            }
        } catch (err) {
            console.error('Error fetching feed posts:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchOnlineUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://n8n.gopocket.in/webhook/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: 'online'
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch online users: ${response.statusText}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                setOnlineUsers(data);
            } else {
                setOnlineUsers([]);
            }
        } catch (err) {
            console.error('Error fetching online users:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchBirthdaysAnniversaries = useCallback(async (force = false) => {
        if (!force && birthdaysAnniversaries.length > 0) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://n8n.gopocket.in/webhook/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: 'birthday'
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch birthdays and anniversaries: ${response.statusText}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                // Filter to show only upcoming events within next 30 days
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const thirtyDaysLater = new Date(today);
                thirtyDaysLater.setDate(today.getDate() + 30);

                const filteredData = data.filter(item => {
                    // Check birthday
                    const birthDate = new Date(item.date_of_birth);
                    let birthThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

                    // If birthday already passed this year, check next year
                    if (birthThisYear < today) {
                        birthThisYear = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
                    }

                    // Check work anniversary
                    const joinDate = new Date(item.date_of_joining);
                    let anniversaryThisYear = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());

                    // If anniversary already passed this year, check next year
                    if (anniversaryThisYear < today) {
                        anniversaryThisYear = new Date(today.getFullYear() + 1, joinDate.getMonth(), joinDate.getDate());
                    }

                    // Include if birthday or anniversary is within next 30 days
                    const isBirthdayUpcoming = birthThisYear >= today && birthThisYear <= thirtyDaysLater;
                    const isAnniversaryUpcoming = anniversaryThisYear >= today && anniversaryThisYear <= thirtyDaysLater;

                    return isBirthdayUpcoming || isAnniversaryUpcoming;
                });

                setAllEmployees(data);
                setBirthdaysAnniversaries(filteredData);
            } else {
                setAllEmployees([]);
                setBirthdaysAnniversaries([]);
            }
        } catch (err) {
            console.error('Error fetching birthdays and anniversaries:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);


    const createFeedPost = useCallback(async (postData: {
        employee: string;
        designation: string;
        name: string;
        content: string;
        type: string;
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://n8n.gopocket.in/webhook/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: 'feedpost',
                    ...postData
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create feed post: ${response.statusText}`);
            }

            // After posting, fetch the latest posts
            await fetchFeedPosts();
        } catch (err) {
            console.error('Error creating feed post:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [fetchFeedPosts]);

    return (
        <HRMSContext.Provider value={{ hrmsData, feedPosts, onlineUsers, birthdaysAnniversaries, allEmployees, isLoading, error, fetchHRMSData, fetchFeedPosts, fetchOnlineUsers, fetchBirthdaysAnniversaries, createFeedPost }}>
            {children}
        </HRMSContext.Provider>
    );
};
