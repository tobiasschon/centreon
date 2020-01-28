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

namespace Centreon\Infrastructure\Monitoring;

use Centreon\Domain\Contact\Interfaces\ContactInterface;
use Centreon\Infrastructure\Repository\AbstractRepositoryDRB;
use Centreon\Domain\Security\AccessGroup;
use Centreon\Domain\Monitoring\HostCounter;
use Centreon\Domain\Monitoring\Interfaces\CounterRepositoryInterface;
use Centreon\Infrastructure\DatabaseConnection;

/**
 * Database repository for the real time monitoring of services and host.
 *
 * @package Centreon\Infrastructure\Monitoring
 */
final class CounterRepositoryRDB extends AbstractRepositoryDRB implements CounterRepositoryInterface
{
    /**
     * @var string Name of the configuration database
     */
    private $centreonDbName;

    /**
     * @var string Name of the storage database
     */
    private $storageDbName;

    /**
     * CounterRepositoryRDB constructor.
     *
     * @param DatabaseConnection $pdo
     */
    public function __construct(DatabaseConnection $pdo)
    {
        $this->db = $pdo;
        $this->centreonDbName = $this->db->getCentreonDbName();
        $this->storageDbName = $this->db->getStorageDbName();
    }

    /**
     * @inheritDoc
     */
    public function filterByAccessGroups(array $accessGroups): CounterRepositoryInterface
    {
        $this->accessGroups = $accessGroups;
        return $this;
    }

    /**
     * @inheritDoc
     * @throws \Exception
     */
    public function countHostsForNonAdminUser(): HostCounter
    {
        if ($this->hasNotEnoughRightsToContinue()) {
            return new HostCounter();
        }

        // Internal call for non admin user
        return $this->countHosts(false);
    }

    /**
     * @inheritDoc
     */
    public function countHostsForAdminUser(): HostCounter
    {
        // Internal call for an admin user
        return $this->countHosts(true);
    }

    /**
     * Count all hosts by status filtered by admin / non admin user
     *
     * @return HostCounter The number of hosts by status
     */
    private function countHosts(bool $isAdmin = false): HostCounter
    {
        $counter = new HostCounter();

        $request = 'SELECT
            COALESCE(SUM(CASE WHEN h.state = 0 THEN 1 ELSE 0 END), 0) AS up_total,
            COALESCE(SUM(CASE WHEN h.state = 1 THEN 1 ELSE 0 END), 0) AS down_total,
            COALESCE(SUM(CASE WHEN h.state = 2 THEN 1 ELSE 0 END), 0) AS unreachable_total,
            COALESCE(SUM(CASE WHEN h.state = 4 THEN 1 ELSE 0 END), 0) AS pending_total,
            COALESCE(SUM(CASE WHEN h.state = 1 AND (h.acknowledged = 0 AND h.scheduled_downtime_depth = 0)
                THEN 1 ELSE 0 END), 0) AS down_unhandled,
            COALESCE(SUM(CASE WHEN h.state = 2 AND (h.acknowledged = 0 AND h.scheduled_downtime_depth = 0)
                THEN 1 ELSE 0 END), 0) AS unreachable_unhandled
            FROM `:dbstg`.hosts h, `:dbstg`.instances i
            WHERE i.deleted = 0
            AND h.instance_id = i.instance_id
            AND h.enabled = 1
            AND h.name NOT LIKE "_Module_%"';

        if (!$isAdmin) {
            $request .= ' AND EXISTS (
                SELECT a.host_id FROM centreon_acl a
                WHERE a.host_id = h.host_id
                AND a.group_id IN (' . $this->accessGroupIdToString($this->accessGroups) . '))';
        }

        $request = $this->translateDbName($request);
        $statement = $this->db->prepare($request);
        $statement->execute();

        if ($result = $statement->fetch(\PDO::FETCH_ASSOC)) {
            $counter->setDownUnhandled((int) $result['down_unhandled'])
                ->setDownTotal((int) $result['down_total'])
                ->setUnreachableUnhandled((int) $result['unreachable'])
                ->setUnreachableTotal((int) $result['unreachable_total'])
                ->setUp((int) $result['up_total'])
                ->setPending((int) $result['pending_total'])
                ->setTotal($result['down_total'] + $result['unreachable_total'] + $result['up_total']);
        }

        return $counter;
    }
}
