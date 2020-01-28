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

use JMS\Serializer\Annotation as Serializer;
use Centreon\Domain\Annotation\EntityDescriptor as Desc;

/**
 * Class representing a record of a host in the repository.
 *
 * @package Centreon\Domain\Monitoring
 */
class HostCounter
{
    /**
     * @var int Total number of down hosts
     */
    private $downTotal = 0;
    /**
     * @var int Number of down and unhandled hosts
     */
    private $downUnhandled = 0;
    /**
     * @var int Total number of unreachable hosts
     */
    private $unreachableTotal = 0;
    /**
     * @var int Number of unreachable and unhandled hosts
     */
    private $unreachableUnhandled = 0;
    /**
     * @var int Number of up hosts
     */
    private $up = 0;
    /**
     * @var int Number of pending hosts
     */
    private $pending = 0;
    /**
     * @var int Total number of hosts
     */
    private $total = 0;

    /**
     * @return int
     */
    public function getDownTotal(): int
    {
        return $this->downTotal;
    }

    /**
     * @param int $downTotal
     * @return HostCounter
     */
    public function setDownTotal(int $downTotal): HostCounter
    {
        $this->downTotal = $downTotal;
        return $this;
    }

    /**
     * @return int
     */
    public function getDownUnhandled(): int
    {
        return $this->downUnhandled;
    }

    /**
     * @param int $downUnhandled
     * @return HostCounter
     */
    public function setDownUnhandled(int $downUnhandled): HostCounter
    {
        $this->downUnhandled = $downUnhandled;
        return $this;
    }

    /**
     * @return int
     */
    public function getUnreachableTotal(): int
    {
        return $this->unreachableTotal;
    }

    /**
     * @param int $unreachableTotal
     * @return HostCounter
     */
    public function setUnreachableTotal(int $unreachableTotal): HostCounter
    {
        $this->unreachableTotal = $unreachableTotal;
        return $this;
    }

    /**
     * @return int
     */
    public function getUnreachableUnhandled(): int
    {
        return $this->unreachableUnhandled;
    }

    /**
     * @param int $unreachableUnhandled
     * @return HostCounter
     */
    public function setUnreachableUnhandled(int $unreachableUnhandled): HostCounter
    {
        $this->unreachableTotal = $unreachableUnhandled;
        return $this;
    }

    /**
     * @return int
     */
    public function getUp(): int
    {
        return $this->up;
    }

    /**
     * @param int $up
     * @return HostCounter
     */
    public function setUp(int $up): HostCounter
    {
        $this->up = $up;
        return $this;
    }

    /**
     * @return int
     */
    public function getPending(): int
    {
        return $this->pending;
    }

    /**
     * @param int $pending
     * @return HostCounter
     */
    public function setPending(int $pending): HostCounter
    {
        $this->pending = $pending;
        return $this;
    }

    /**
     * @return int
     */
    public function getTotal(): int
    {
        return $this->total;
    }

    /**
     * @param int $total
     * @return HostCounter
     */
    public function setTotal(int $total): HostCounter
    {
        $this->total = $total;
        return $this;
    }
}
