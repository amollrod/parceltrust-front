import { BaseHttpService } from './BaseHttpService';

const BASE_URL = 'http://parceltrust.localtest.me:8080';
const PACKAGES_RESOURCE = '/packages';

class PackageService extends BaseHttpService {
    constructor() {
        super(BASE_URL);
    }

    createPackage(data: CreatePackageRequest, token: string): Promise<PackageResponse> {
        return this.post<PackageResponse>(PACKAGES_RESOURCE, token, data);
    }

    findPackage(id: string, token: string): Promise<PackageResponse> {
        return this.get<PackageResponse>(`${PACKAGES_RESOURCE}/${id}`, token);
    }

    getPackageHistory(id: string, token: string): Promise<PackageHistoryResponse[]> {
        return this.get<PackageHistoryResponse[]>(`${PACKAGES_RESOURCE}/${id}/history`, token);
    }

    updatePackageStatus(
        id: string,
        status: PackageStatus,
        newLocation: string,
        token: string
    ): Promise<PackageResponse> {
        const query = new URLSearchParams({ status, newLocation }).toString();
        return this.patch<PackageResponse>(`${PACKAGES_RESOURCE}/${id}/status?${query}`, token);
    }

    searchPackages(params: SearchPackagesParams, token: string): Promise<PagePackageResponse> {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.origin) queryParams.append('origin', params.origin);
        if (params.destination) queryParams.append('destination', params.destination);
        if (params.location) queryParams.append('location', params.location);
        if (params.fromDate) queryParams.append('fromDate', params.fromDate.toISOString());
        if (params.toDate) queryParams.append('toDate', params.toDate.toISOString());
        queryParams.append('page', String(params.page ?? 0));
        queryParams.append('size', String(params.size ?? 10));

        return this.get<PagePackageResponse>(
            `${PACKAGES_RESOURCE}/search?${queryParams.toString()}`,
            token
        );
    }
}

export const packageService = new PackageService();

export interface CreatePackageRequest {
    origin: string;
    destination: string;
}

export const PACKAGE_STATUSES = [
    'CREATED',
    'IN_TRANSIT',
    'IN_STORE',
    'DELIVERED',
    'RETURNED',
    'CANCELED',
    'LOST',
] as const;

export type PackageStatus = typeof PACKAGE_STATUSES[number];

export interface PackageHistoryResponse {
    status: PackageStatus;
    location: string;
    timestamp: number;
}

export interface PackageResponse {
    id: string;
    origin: string;
    destination: string;
    status: PackageStatus;
    lastLocation: string;
    lastTimestamp: number;
}

export interface PagePackageResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: PackageResponse[];
    number: number;
    sort: SortObject;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    pageable: PageableObject;
    empty: boolean;
}

export interface PageableObject {
    offset: number;
    sort: SortObject;
    unpaged: boolean;
    paged: boolean;
    pageNumber: number;
    pageSize: number;
}

export interface SortObject {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}

export interface SearchPackagesParams {
    status?: PackageStatus;
    origin?: string;
    destination?: string;
    location?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    size?: number;
}
