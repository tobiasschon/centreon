<?php
/*
 * Copyright 2005 - 2019 Centreon (https://www.centreon.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For more information : contact@centreon.com
 *
 */
declare(strict_types=1);

namespace Centreon\Domain\Monitoring;

use Centreon\Domain\Contact\Contact;
use Centreon\Domain\Monitoring\HostCounter;
use Centreon\Domain\Monitoring\Interfaces\CounterServiceInterface;
use Centreon\Domain\Monitoring\Interfaces\CounterRepositoryInterface;
use Centreon\Domain\Security\Interfaces\AccessGroupRepositoryInterface;
use Centreon\Domain\Service\AbstractCentreonService;

/**
 * Monitoring class used to get real time status counter
 *
 * @package Centreon\Domain\Monitoring
 */
class CounterService extends AbstractCentreonService implements CounterServiceInterface
{
    /**
     * @var CounterRepositoryInterface
     */
    private $counterRepository;

    /**
     * @var AccessGroupRepositoryInterface
     */
    private $accessGroupRepository;

    /**
     * @param MonitoringRepositoryInterface $monitoringRepository
     * @param AccessGroupRepositoryInterface $accessGroupRepository
     */
    public function __construct(
        CounterRepositoryInterface $counterRepository,
        AccessGroupRepositoryInterface $accessGroupRepository
    ) {
        $this->counterRepository = $counterRepository;
        $this->accessGroupRepository = $accessGroupRepository;
    }

    /**
     * {@inheritDoc}
     * @param Contact $contact
     * @return self
     */
    public function filterByContact($contact): self
    {
        parent::filterByContact($contact);

        $accessGroups = $this->accessGroupRepository->findByContact($contact);

        $this->counterRepository
            ->filterByAccessGroups($accessGroups);

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function countHosts(): HostCounter
    {
        return $this->counterRepository->countHostsForAdminUser();
    }
}
